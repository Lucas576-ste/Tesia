"use server";

import { calcularPrazoInterno, criarCalendario } from "@tesia/prazos";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { esquemaPrazoManual, hojeBrasilia, type PrazoManual } from "@/lib/prazo-manual";
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
  const interno = ehPrazo
    ? dados.prazoInterno ||
      calcularPrazoInterno({ fatal: dados.data, hoje, calendario: criarCalendario() })
    : null;
  const { error } = await supabase.from("prazos").insert({
    escritorio_id: usuario.escritorio_id,
    processo_id: z.uuid().safeParse(dados.processoId).success ? dados.processoId : null,
    origem: "manual",
    tipo: dados.tipo,
    descricao: dados.descricao,
    data_vencimento: dados.data,
    hora: dados.hora || null,
    data_prazo_interno: interno,
    data_inicio: ehPrazo && dados.inicio ? dados.inicio : null,
    status: "confirmado",
    confirmado_por: usuario.id,
    confirmado_em: new Date().toISOString(),
    responsavel_id: usuario.id,
  });
  if (error)
    return { erro: "Não foi possível salvar. Confira o processo escolhido e tente de novo." };
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
