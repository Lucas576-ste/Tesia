"use server";

import { z } from "zod";
import { lerPlano } from "@/lib/plano-servidor";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { contarVencendo } from "@/lib/lia/contexto";
import { limiteLia } from "@/lib/lia/limites";

export type ConversaResumo = { id: string; titulo: string; atualizadaEm: string };

export type MensagemSalva = {
  id: string;
  papel: "usuario" | "lia";
  conteudo: string;
  avaliacao: "positiva" | "negativa" | null;
};

const conversaSchema = z.object({ id: z.uuid(), titulo: z.string(), atualizada_em: z.string() });
const mensagemSchema = z.object({
  id: z.uuid(),
  papel: z.enum(["usuario", "lia"]),
  conteudo: z.string(),
  avaliacao: z.enum(["positiva", "negativa"]).nullable(),
});

export async function listarConversas(): Promise<ConversaResumo[]> {
  const usuario = await usuarioAtual();
  if (!usuario) return [];
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("conversas_lia")
    .select("id, titulo, atualizada_em")
    .order("atualizada_em", { ascending: false })
    .limit(30);
  return (z.array(conversaSchema).safeParse(data).data ?? []).map((linha) => ({
    id: linha.id,
    titulo: linha.titulo,
    atualizadaEm: linha.atualizada_em,
  }));
}

export async function abrirConversa(id: string): Promise<MensagemSalva[]> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(id).success) return [];
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("mensagens_lia")
    .select("id, papel, conteudo, avaliacao")
    .eq("conversa_id", id)
    .order("criada_em")
    .limit(100);
  return z.array(mensagemSchema).safeParse(data).data ?? [];
}

export async function apagarConversa(id: string): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(id).success) return { erro: "Conversa inválida." };
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("conversas_lia").delete().eq("id", id);
  return error ? { erro: "Não foi possível apagar a conversa." } : { ok: true };
}

const avaliacaoSchema = z.object({
  mensagemId: z.uuid(),
  avaliacao: z.enum(["positiva", "negativa"]),
  comentario: z.string().trim().max(500).optional(),
});

export async function avaliarResposta(
  entrada: z.input<typeof avaliacaoSchema>,
): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const dados = avaliacaoSchema.safeParse(entrada);
  if (!dados.success) return { erro: "Avaliação inválida." };
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("mensagens_lia")
    .update({
      avaliacao: dados.data.avaliacao,
      avaliacao_comentario: dados.data.comentario || null,
    })
    .eq("id", dados.data.mensagemId)
    .eq("papel", "lia");
  return error ? { erro: "Não foi possível salvar sua avaliação." } : { ok: true };
}

export async function consultarUsoLia(): Promise<{ usadas: number; limite: number }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { usadas: 0, limite: 0 };
  const supabase = await criarClienteServidor();
  const [estado, { data }] = await Promise.all([lerPlano(), supabase.rpc("perguntas_lia_hoje")]);
  return { usadas: z.number().safeParse(data).data ?? 0, limite: limiteLia(estado.id) };
}

export async function consultarVencendoLia() {
  const usuario = await usuarioAtual();
  return usuario ? contarVencendo() : 0;
}
