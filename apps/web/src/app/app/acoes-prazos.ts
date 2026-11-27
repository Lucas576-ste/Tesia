"use server";

import { calcularPrazoInterno, criarCalendario } from "@tesia/prazos";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { buscarCalendario } from "@/lib/analise";
import { avisoDeCalendario } from "@/lib/cobertura-calendario";
import {
  agruparPresets,
  calculoPrazoSchema,
  esquemaPrazoManual,
  hojeBrasilia,
  nomeDaPeca,
  type CalculoPrazo,
  type PrazoManual,
  type PresetPrazo,
} from "@/lib/prazo-manual";
import { recalcularPrazo } from "@/lib/recalculo-prazo";
import { criarNotificacao } from "@/lib/notificar";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Resultado = { ok: true } | { erro: string };

const assinaturaSchema = z.object({
  status: z.string(),
  planos: z
    .union([z.object({ recursos: z.unknown() }), z.array(z.object({ recursos: z.unknown() }))])
    .nullable()
    .transform((valor) => (Array.isArray(valor) ? (valor[0] ?? null) : valor)),
});

function atualizarTelas() {
  revalidatePath("/app");
  revalidatePath("/app/processos", "layout");
}

const processoLocalSchema = z.object({
  tribunal: z.string().nullable(),
  uf: z.string().nullable(),
  municipio: z.string().nullable(),
  rito: z.string().nullable(),
});

type Sugestao = {
  inicio: string;
  vencimento: string;
  memoria: string[];
  avisoCalendario: string | null;
};

async function calcularSugestao(calculo: CalculoPrazo, processoId: string) {
  const supabase = await criarClienteServidor();
  const idValido = z.uuid().safeParse(processoId).success;
  const { data: linha } = idValido
    ? await supabase
        .from("processos")
        .select("tribunal, uf, municipio, rito")
        .eq("id", processoId)
        .maybeSingle()
    : { data: null };
  const processo = processoLocalSchema.safeParse(linha).data ?? null;
  const calendarioPrazo = await buscarCalendario(supabase, processo, processo?.rito ?? "comum");
  const resultado = recalcularPrazo(
    {
      dias: calculo.dias,
      contagem: calculo.contagem,
      fundamento: calculo.fundamento,
      revisada: true,
    },
    calendarioPrazo,
    {
      forma: calculo.forma,
      disponibilizacao: calculo.marco,
      envio: calculo.marco,
      abertura: calculo.abertura,
    },
    hojeBrasilia(),
  );
  const sugestao: Sugestao | null = resultado
    ? {
        inicio: resultado.inicio,
        vencimento: resultado.vencimento,
        memoria: resultado.memoria,
        avisoCalendario: avisoDeCalendario(calendarioPrazo.cobertura, [
          calculo.marco,
          resultado.inicio,
          resultado.vencimento,
        ]),
      }
    : null;
  return { sugestao, calendarioPrazo };
}

const regraDoPresetSchema = z.object({
  id: z.uuid(),
  area: z.string(),
  tipo_peca_codigo: z.string(),
  dias: z.number(),
  contagem: z.enum(["uteis", "corridos"]),
  fundamento: z.string(),
  ativa: z.boolean(),
});
const tipoPecaNomeSchema = z.object({ area: z.string(), codigo: z.string(), nome: z.string() });

export async function presetsDePrazo(): Promise<PresetPrazo[]> {
  const usuario = await usuarioAtual();
  if (!usuario) return [];
  const supabase = await criarClienteServidor();
  const [{ data: regras }, { data: tipos }] = await Promise.all([
    supabase
      .from("regras_prazo")
      .select("id, area, tipo_peca_codigo, dias, contagem, fundamento, ativa"),
    supabase.from("tipos_peca").select("area, codigo, nome"),
  ]);
  const nomes = new Map(
    (z.array(tipoPecaNomeSchema).safeParse(tipos).data ?? []).map((tipo) => [
      `${tipo.area}|${tipo.codigo}`,
      tipo.nome,
    ]),
  );
  return agruparPresets(
    (z.array(regraDoPresetSchema).safeParse(regras).data ?? []).map((regra) => ({
      id: regra.id,
      peca: nomeDaPeca(nomes, regra.area, regra.tipo_peca_codigo),
      dias: regra.dias,
      contagem: regra.contagem,
      fundamento: regra.fundamento,
      revisada: regra.ativa,
    })),
  );
}

const sugestaoEntradaSchema = calculoPrazoSchema.extend({ processoId: z.string() });

export async function sugerirPrazo(
  entrada: unknown,
): Promise<({ ok: true } & Sugestao) | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const dados = sugestaoEntradaSchema.safeParse(entrada);
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Confira os dados." };
  const { sugestao } = await calcularSugestao(dados.data, dados.data.processoId);
  if (!sugestao) return { erro: "Não consegui calcular. Confira as datas." };
  return { ok: true, ...sugestao };
}

const regraRevisadaSchema = z.object({ ativa: z.boolean() });

export async function criarPrazoManual(entrada: PrazoManual): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const hoje = hojeBrasilia();
  const resultado = esquemaPrazoManual(hoje).safeParse(entrada);
  if (!resultado.success) return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos." };
  const dados = resultado.data;

  const supabase = await criarClienteServidor();
  const { data: linhaAssinatura } = await supabase
    .from("assinaturas")
    .select("status, planos(recursos)")
    .maybeSingle();
  const assinatura = assinaturaSchema.safeParse(linhaAssinatura).data;
  const recursos = z
    .object({ prazos_manuais: z.boolean().optional() })
    .safeParse(assinatura?.planos?.recursos).data;
  if (assinatura?.status !== "trial" && !recursos?.prazos_manuais) {
    return { erro: "Prazos manuais e audiências fazem parte do plano Pro." };
  }

  const ehPrazo = dados.tipo === "prazo";
  const calculado =
    ehPrazo && dados.calculo ? await calcularSugestao(dados.calculo, dados.processoId) : null;
  const sugestao = calculado?.sugestao ?? null;
  let regraRevisada = false;
  if (sugestao && dados.calculo?.regraId) {
    const { data: regra } = await supabase
      .from("regras_prazo")
      .select("ativa")
      .eq("id", dados.calculo.regraId)
      .maybeSingle();
    regraRevisada = regraRevisadaSchema.safeParse(regra).data?.ativa ?? false;
  }
  const interno = ehPrazo
    ? dados.prazoInterno ||
      calcularPrazoInterno({
        fatal: dados.data,
        hoje,
        calendario: criarCalendario(calculado?.calendarioPrazo),
      })
    : null;
  const inicio = sugestao && sugestao.inicio <= dados.data ? sugestao.inicio : dados.inicio || null;
  const responsavel = dados.responsavelId || usuario.id;
  const { error } = await supabase.from("prazos").insert({
    escritorio_id: usuario.escritorio_id,
    processo_id: z.uuid().safeParse(dados.processoId).success ? dados.processoId : null,
    origem: "manual",
    tipo: dados.tipo,
    descricao: dados.descricao,
    data_vencimento: dados.data,
    hora: dados.hora || null,
    data_prazo_interno: interno,
    data_inicio: ehPrazo ? inicio : null,
    ...(sugestao &&
      dados.calculo && {
        data_vencimento_sugerida: sugestao.vencimento,
        dias: dados.calculo.dias,
        contagem: dados.calculo.contagem,
        regra_prazo_id: dados.calculo.regraId || null,
        memoria_calculo: { linhas: sugestao.memoria, regra_revisada: regraRevisada },
      }),
    status: "confirmado",
    confirmado_por: usuario.id,
    confirmado_em: new Date().toISOString(),
    responsavel_id: responsavel,
    observacoes: dados.observacoes || null,
  });
  if (error)
    return { erro: "Não foi possível salvar. Confira o processo escolhido e tente de novo." };
  if (responsavel !== usuario.id) {
    await criarNotificacao({
      escritorioId: usuario.escritorio_id,
      usuarioId: responsavel,
      tipo: "tarefa",
      titulo: "Nova tarefa para você",
      texto: dados.descricao,
      href: "/app",
    });
  }
  atualizarTelas();
  return { ok: true };
}

export async function alterarPrazoInterno(prazoId: string, data: string): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(prazoId).success || !z.iso.date().safeParse(data).success) {
    return { erro: "Data inválida." };
  }
  const supabase = await criarClienteServidor();
  const { data: linhas, error } = await supabase
    .from("prazos")
    .update({ data_prazo_interno: data })
    .eq("id", prazoId)
    .eq("tipo", "prazo")
    .gte("data_vencimento", data)
    .select("id");
  if (error || !linhas?.length)
    return { erro: "O prazo interno não pode ser depois do prazo fatal." };
  atualizarTelas();
  return { ok: true };
}

export async function concluirPrazo(prazoId: string, concluido: boolean): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(prazoId).success) return { erro: "Prazo não encontrado." };
  const supabase = await criarClienteServidor();
  const { data: linhas, error } = await supabase
    .from("prazos")
    .update({ status: concluido ? "cumprido" : "confirmado" })
    .eq("id", prazoId)
    .in("status", ["confirmado", "cumprido"])
    .select("id");
  if (error || !linhas?.length) return { erro: "Não foi possível atualizar o prazo." };
  await supabase
    .from("pecas")
    .update({ status: concluido ? "protocolada" : "rascunho" })
    .eq("prazo_id", prazoId)
    .in("status", concluido ? ["rascunho", "revisada"] : ["protocolada"])
    .is("excluido_em", null);
  atualizarTelas();
  return { ok: true };
}
