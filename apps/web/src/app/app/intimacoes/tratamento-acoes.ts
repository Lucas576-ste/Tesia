"use server";

import { normalizarCnj, podeDesvincularProcesso } from "@tesia/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { concluirPrazo } from "@/app/app/acoes-prazos";
import { registrarAuditoria } from "@/lib/auditoria";
import { criarNotificacao } from "@/lib/notificar";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { podeTratarIntimacao, termoDeBuscaDeProcesso } from "@/lib/tratamento-intimacao";

const LIMITE_LOTE = 100;
const idsSchema = z.array(z.uuid()).min(1).max(LIMITE_LOTE);
const SESSAO_EXPIRADA = "Sua sessão expirou. Entre de novo.";

type ResultadoLote =
  { ok: true; feitas: number; puladas: number; prazosMantidos?: number } | { erro: string };

const opcoesSchema = z.object({ cumprirPrazo: z.boolean().default(false) });

const linhaSchema = z.object({
  id: z.uuid(),
  responsavel_id: z.uuid().nullable(),
  tarefa_id: z.uuid().nullable(),
});

function atualizarTelas() {
  revalidatePath("/app");
  revalidatePath("/app/intimacoes");
}

async function levarAoProcesso(
  supabase: Awaited<ReturnType<typeof criarClienteServidor>>,
  intimacaoId: string,
  tarefaId: string | null,
  processoId: string | null,
) {
  const alteracao = { processo_id: processoId };
  await Promise.all([
    supabase.from("prazos").update(alteracao).eq("intimacao_id", intimacaoId),
    supabase.from("pecas").update(alteracao).eq("intimacao_id", intimacaoId),
    ...(tarefaId ? [supabase.from("prazos").update(alteracao).eq("id", tarefaId)] : []),
  ]);
}

async function permitidas(ids: string[], usuarioId: string) {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("intimacoes")
    .select("id, responsavel_id, tarefa_id")
    .in("id", ids)
    .is("excluido_em", null);
  const linhas = z.array(linhaSchema).safeParse(data).data ?? [];
  const autorizadas = linhas.filter(({ responsavel_id }) =>
    podeTratarIntimacao(responsavel_id, usuarioId),
  );
  return { supabase, autorizadas, puladas: linhas.length - autorizadas.length };
}

export async function tratarIntimacoes(
  entrada: string[],
  acao: "concluir" | "ignorar" | "reabrir",
  opcoes: z.input<typeof opcoesSchema> = {},
): Promise<ResultadoLote> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: SESSAO_EXPIRADA };
  const ids = idsSchema.safeParse(entrada);
  if (!ids.success) return { erro: "Escolha de 1 a 100 intimações." };

  const { supabase, autorizadas, puladas } = await permitidas(ids.data, usuario.id);
  if (autorizadas.length === 0) return { ok: true, feitas: 0, puladas };
  const idsOk = autorizadas.map(({ id }) => id);
  const agora = new Date().toISOString();
  const alteracao =
    acao === "concluir"
      ? { tratamento: "concluida" as const, concluida_em: agora, tratada_por: usuario.id }
      : acao === "ignorar"
        ? { tratamento: "ignorada" as const, concluida_em: null, tratada_por: usuario.id }
        : { tratamento: "pendente" as const, concluida_em: null, tratada_por: null };
  const { error } = await supabase.from("intimacoes").update(alteracao).in("id", idsOk);
  if (error) return { erro: "Não foi possível atualizar as intimações." };

  const tarefas = autorizadas.flatMap(({ tarefa_id }) => (tarefa_id ? [tarefa_id] : []));
  if (tarefas.length) {
    await supabase
      .from("prazos")
      .update({ status: acao === "reabrir" ? "confirmado" : "cumprido" })
      .in("id", tarefas);
  }
  if (acao === "reabrir") {
    await supabase
      .from("prazos")
      .update({ status: "sugerido" })
      .in("intimacao_id", idsOk)
      .eq("status", "descartado")
      .is("confirmado_em", null);
  } else {
    await supabase
      .from("prazos")
      .update({ status: "descartado" })
      .in("intimacao_id", idsOk)
      .eq("status", "sugerido");
  }
  let prazosMantidos = 0;
  if (acao === "concluir") {
    const { data: confirmados } = await supabase
      .from("prazos")
      .select("id")
      .in("intimacao_id", idsOk)
      .eq("status", "confirmado");
    const prazos = z.array(z.object({ id: z.uuid() })).safeParse(confirmados).data ?? [];
    prazosMantidos = prazos.length;
    const cumprir = opcoesSchema.safeParse(opcoes).data?.cumprirPrazo && idsOk.length === 1;
    for (const prazo of cumprir ? prazos : []) {
      const resultado = await concluirPrazo(prazo.id, true);
      if ("erro" in resultado) {
        return { erro: "A intimação foi concluída, mas o prazo não foi marcado como cumprido." };
      }
      await registrarAuditoria(usuario, "prazo_cumprido", "prazos", prazo.id);
      prazosMantidos -= 1;
    }
  }
  await registrarAuditoria(
    usuario,
    `intimacao_${acao}`,
    "intimacoes",
    idsOk.length === 1 ? idsOk[0] : undefined,
  );
  atualizarTelas();
  return { ok: true, feitas: idsOk.length, puladas, prazosMantidos };
}

export async function encaminharIntimacoes(
  entrada: string[],
  destinoId: string,
): Promise<ResultadoLote> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: SESSAO_EXPIRADA };
  const ids = idsSchema.safeParse(entrada);
  if (!ids.success || !z.uuid().safeParse(destinoId).success) return { erro: "Pedido inválido." };

  const { supabase, autorizadas, puladas } = await permitidas(ids.data, usuario.id);
  const { data: destino } = await supabase
    .from("usuarios")
    .select("id, nome")
    .eq("id", destinoId)
    .maybeSingle();
  const alvo = z.object({ id: z.uuid(), nome: z.string() }).safeParse(destino);
  if (!alvo.success) return { erro: "Escolha uma pessoa do escritório." };
  if (autorizadas.length === 0) return { ok: true, feitas: 0, puladas };

  const idsOk = autorizadas.map(({ id }) => id);
  const { error } = await supabase
    .from("intimacoes")
    .update({ responsavel_id: alvo.data.id })
    .in("id", idsOk);
  if (error) return { erro: "Não foi possível encaminhar." };
  const tarefas = autorizadas.flatMap(({ tarefa_id }) => (tarefa_id ? [tarefa_id] : []));
  if (tarefas.length) {
    await supabase.from("prazos").update({ responsavel_id: alvo.data.id }).in("id", tarefas);
  }
  if (alvo.data.id !== usuario.id) {
    await criarNotificacao({
      escritorioId: usuario.escritorio_id,
      usuarioId: alvo.data.id,
      tipo: "intimacao",
      titulo:
        idsOk.length === 1
          ? "Intimação encaminhada para você"
          : `${idsOk.length} intimações encaminhadas para você`,
      texto: `Encaminhada por ${usuario.nome}`,
      href: idsOk.length === 1 ? `/app/intimacoes/${idsOk[0]}` : "/app/intimacoes",
    });
  }
  await registrarAuditoria(
    usuario,
    "intimacao_encaminhada",
    "intimacoes",
    idsOk.length === 1 ? idsOk[0] : undefined,
  );
  atualizarTelas();
  return { ok: true, feitas: idsOk.length, puladas };
}

export type ProcessoBusca = { id: string; cnj: string; partes: string };

const processoSchema = z.object({
  id: z.uuid(),
  numero_cnj: z.string(),
  partes: z.string().nullable(),
  parte_contraria: z.string().nullable(),
});

export async function buscarProcessosParaVincular(entrada: string): Promise<ProcessoBusca[]> {
  const usuario = await usuarioAtual();
  if (!usuario) return [];
  const termo = termoDeBuscaDeProcesso(entrada);
  if (!termo) return [];
  const supabase = await criarClienteServidor();
  const consulta = supabase
    .from("processos")
    .select("id, numero_cnj, partes, parte_contraria")
    .is("excluido_em", null)
    .limit(8);
  const { data } =
    termo.tipo === "cnj"
      ? await consulta.eq("numero_cnj", termo.valor)
      : await consulta.or(
          `numero_cnj.ilike.%${termo.valor}%,partes.ilike.%${termo.valor}%,parte_contraria.ilike.%${termo.valor}%`,
        );
  return (z.array(processoSchema).safeParse(data).data ?? []).map((processo) => ({
    id: processo.id,
    cnj: processo.numero_cnj,
    partes: processo.partes ?? processo.parte_contraria ?? processo.numero_cnj,
  }));
}

export async function vincularProcesso(
  intimacaoId: string,
  processoId: string,
): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: SESSAO_EXPIRADA };
  if (!z.uuid().safeParse(intimacaoId).success || !z.uuid().safeParse(processoId).success)
    return { erro: "Pedido inválido." };
  const supabase = await criarClienteServidor();
  const { data: processo } = await supabase
    .from("processos")
    .select("id, numero_cnj")
    .eq("id", processoId)
    .is("excluido_em", null)
    .maybeSingle();
  const alvo = z.object({ id: z.uuid(), numero_cnj: z.string() }).safeParse(processo);
  if (!alvo.success) return { erro: "Processo não encontrado." };
  const digitos = normalizarCnj(alvo.data.numero_cnj);
  const { data, error } = await supabase
    .from("intimacoes")
    .update({ processo_id: alvo.data.id, ...(digitos ? { numero_processo: digitos } : {}) })
    .eq("id", intimacaoId)
    .is("excluido_em", null)
    .select("id, tarefa_id");
  const linha = z.array(linhaSchema.pick({ id: true, tarefa_id: true })).safeParse(data).data?.[0];
  if (error || !linha) return { erro: "Não foi possível vincular o processo." };
  await levarAoProcesso(supabase, intimacaoId, linha.tarefa_id, alvo.data.id);
  await registrarAuditoria(usuario, "intimacao_vinculada", "intimacoes", intimacaoId);
  atualizarTelas();
  revalidatePath(`/app/intimacoes/${intimacaoId}`);
  return { ok: true };
}

export async function desvincularProcesso(
  intimacaoId: string,
): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: SESSAO_EXPIRADA };
  if (!podeDesvincularProcesso(usuario.papel))
    return { erro: "Só o dono do escritório desvincula o processo." };
  if (!z.uuid().safeParse(intimacaoId).success) return { erro: "Pedido inválido." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("intimacoes")
    .update({ processo_id: null })
    .eq("id", intimacaoId)
    .is("excluido_em", null)
    .select("id, tarefa_id");
  const linha = z.array(linhaSchema.pick({ id: true, tarefa_id: true })).safeParse(data).data?.[0];
  if (error || !linha) return { erro: "Não foi possível desvincular." };
  await levarAoProcesso(supabase, intimacaoId, linha.tarefa_id, null);
  await registrarAuditoria(usuario, "intimacao_desvinculada", "intimacoes", intimacaoId);
  atualizarTelas();
  revalidatePath(`/app/intimacoes/${intimacaoId}`);
  return { ok: true };
}
