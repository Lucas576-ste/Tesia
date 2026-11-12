"use server";

import { analiseGravadaSchema } from "@tesia/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { STATUS_INTIMACAO, idsSchema, registroSchema } from "@/lib/envio-intimacao";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const statusSchema = z.array(z.object({ id: z.uuid(), status: z.enum(STATUS_INTIMACAO) }));

export async function registrarIntimacao(
  caminho: string,
): Promise<{ id: string } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };

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
