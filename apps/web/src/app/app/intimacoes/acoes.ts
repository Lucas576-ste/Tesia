"use server";

import { analiseGravadaSchema, nomePartes } from "@tesia/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { limitar, MENSAGEM_LIMITE } from "@/lib/limite";
import { STATUS_INTIMACAO, idsSchema, registroSchema } from "@/lib/envio-intimacao";
import { usuarioAtual } from "@/lib/sessao";
import { buscarUsoPecas } from "@/lib/uso-pecas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const statusSchema = z.array(z.object({ id: z.uuid(), status: z.enum(STATUS_INTIMACAO) }));

export async function registrarIntimacao(
  caminho: string,
): Promise<{ id: string } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };

  if (!(await limitar(`envio:${usuario.id}`, 60, 3600))) return { erro: MENSAGEM_LIMITE };
  const resultado = registroSchema.safeParse({ caminho });
  if (!resultado.success || !caminho.startsWith(`${usuario.escritorio_id}/`)) {
    return { erro: "Arquivo inválido." };
  }

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("intimacoes")
    .insert({
      escritorio_id: usuario.escritorio_id,
      origem: "upload",
      arquivo_path: caminho,
      status: "recebida",
    })
    .select("id")
    .single();

  const linha = z.object({ id: z.uuid() }).safeParse(data);
  if (error || !linha.success) return { erro: "Não foi possível registrar a intimação." };
  return { id: linha.data.id };
}

export async function consultarStatus(ids: string[]) {
  const resultado = idsSchema.safeParse(ids);
  if (!resultado.success || resultado.data.length === 0) return [];

  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("intimacoes").select("id, status").in("id", resultado.data);
  const linhas = statusSchema.safeParse(data);
  return linhas.success ? linhas.data : [];
}

const confirmacaoSchema = z
  .object({
    intimacaoId: z.uuid(),
    vencimento: z.iso.date("Informe o prazo fatal."),
    interno: z.iso.date("Informe o prazo interno."),
    recalculo: z
      .object({
        sugerida: z.iso.date(),
        inicio: z.iso.date(),
        memoria: z.array(z.string().max(300)).max(20),
        regraRevisada: z.boolean(),
      })
      .optional(),
  })
  .refine(({ vencimento, interno }) => interno <= vencimento, {
    message: "O prazo interno não pode ser depois do prazo fatal.",
  });

const prazoExistenteSchema = z.object({ id: z.uuid(), data_inicio: z.string().nullable() });
const intimacaoSchema = z.object({ processo_id: z.uuid().nullable(), extracao: z.unknown() });

export async function confirmarPrazo(
  entrada: z.input<typeof confirmacaoSchema>,
): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };

  const resultado = confirmacaoSchema.safeParse(entrada);
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Datas inválidas." };
  }
  const { intimacaoId, vencimento, interno, recalculo } = resultado.data;
  const supabase = await criarClienteServidor();
  const novoCalculo = recalculo
    ? {
        data_vencimento_sugerida: recalculo.sugerida,
        data_inicio: recalculo.inicio <= vencimento ? recalculo.inicio : null,
        memoria_calculo: { linhas: recalculo.memoria, regra_revisada: recalculo.regraRevisada },
      }
    : {};
  const confirmacao = {
    ...novoCalculo,
    status: "confirmado",
    data_vencimento: vencimento,
    data_prazo_interno: interno,
    confirmado_por: usuario.id,
    confirmado_em: new Date().toISOString(),
  };

  const { data: existentes } = await supabase
    .from("prazos")
    .select("id, data_inicio")
    .eq("intimacao_id", intimacaoId)
    .in("status", ["sugerido", "confirmado"])
    .order("criado_em", { ascending: false })
    .limit(1);
  const existente = z.array(prazoExistenteSchema).safeParse(existentes).data?.[0];

  if (existente) {
    const inicioValido = existente.data_inicio && existente.data_inicio <= vencimento;
    const { error } = await supabase
      .from("prazos")
      .update({ ...(inicioValido || recalculo ? {} : { data_inicio: null }), ...confirmacao })
      .eq("id", existente.id);
    if (error) return { erro: "Não foi possível confirmar o prazo." };
  } else {
    const { data: linha } = await supabase
      .from("intimacoes")
      .select("processo_id, extracao")
      .eq("id", intimacaoId)
      .maybeSingle();
    const intimacao = intimacaoSchema.safeParse(linha);
    if (!intimacao.success) return { erro: "Intimação não encontrada." };
    const analise = analiseGravadaSchema.safeParse(intimacao.data.extracao);
    const peca = analise.data?.pecas.find((item) => item.recomendada)?.nome ?? "Prazo da intimação";
    const { error } = await supabase.from("prazos").insert({
      ...confirmacao,
      escritorio_id: usuario.escritorio_id,
      processo_id: intimacao.data.processo_id,
      intimacao_id: intimacaoId,
      origem: "intimacao",
      descricao: peca,
    });
    if (error) return { erro: "Não foi possível confirmar o prazo." };
  }

  revalidatePath("/app");
  return { ok: true };
}

const tipoPecaSchema = z.object({ id: z.uuid(), nome: z.string(), area: z.string() });

export async function gerarRascunho(
  intimacaoId: string,
  codigoPeca: string,
): Promise<{ id: string } | { erro: string } | { limite: true }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  if (!z.uuid().safeParse(intimacaoId).success || !/^[a-z_]{2,60}$/.test(codigoPeca)) {
    return { erro: "Pedido inválido." };
  }
  if (!(await limitar(`ia:${usuario.id}`, 20, 3600))) return { erro: MENSAGEM_LIMITE };

  const supabase = await criarClienteServidor();
  const { data: linhaIntimacao } = await supabase
    .from("intimacoes")
    .select("processo_id, extracao")
    .eq("id", intimacaoId)
    .maybeSingle();
  const intimacao = intimacaoSchema.safeParse(linhaIntimacao);
  const analise = analiseGravadaSchema.safeParse(intimacao.data?.extracao);
  if (!intimacao.success || !analise.success) return { erro: "Intimação não encontrada." };

  const { data: prazos } = await supabase
    .from("prazos")
    .select("id")
    .eq("intimacao_id", intimacaoId)
    .in("status", ["confirmado", "cumprido"])
    .limit(1);
  const prazo = z.array(z.object({ id: z.uuid() })).safeParse(prazos).data?.[0];
  if (!prazo) return { erro: "Confirme o prazo antes de gerar o rascunho." };

  const { data: tipos } = await supabase
    .from("tipos_peca")
    .select("id, nome, area")
    .eq("codigo", codigoPeca)
    .eq("ativa", true);
  const lista = z.array(tipoPecaSchema).safeParse(tipos).data ?? [];
  const tipo =
    lista.find((item) => item.area === analise.data.dados.area) ??
    lista.find((item) => item.area === "geral") ??
    lista[0];
  if (!tipo) return { erro: "Tipo de peça não encontrado." };

  const uso = await buscarUsoPecas();
  if (uso.usadas >= uso.limite) return { limite: true };

  const { data, error } = await supabase
    .from("pecas")
    .insert({
      escritorio_id: usuario.escritorio_id,
      processo_id: intimacao.data.processo_id,
      intimacao_id: intimacaoId,
      prazo_id: prazo.id,
      tipo_peca_id: tipo.id,
      responsavel_id: usuario.id,
      titulo: `${tipo.nome} · ${nomePartes(analise.data.dados.partes)}`,
      status: "gerando",
    })
    .select("id")
    .single();
  const linha = z.object({ id: z.uuid() }).safeParse(data);
  if (error || !linha.success) return { erro: "Não foi possível começar o rascunho." };
  return { id: linha.data.id };
}
