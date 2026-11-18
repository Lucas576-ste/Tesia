"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CODIGO_AREA } from "@/lib/onboarding";
import { dadosProcessoSchema, type DadosProcesso } from "@/lib/processo-tipos";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Resultado = { ok: true; id: string } | { erro: string };

function colunas(dados: DadosProcesso) {
  return {
    numero_cnj: dados.cnj,
    partes: dados.partes,
    area: CODIGO_AREA[dados.area],
    tribunal: dados.tribunal,
    orgao: dados.vara,
  };
}

function mensagemErro(codigo: string | undefined) {
  return codigo === "23505"
    ? "Já existe um processo com este número."
    : "Não foi possível salvar o processo.";
}

export async function criarProcesso(entrada: DadosProcesso): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const dados = dadosProcessoSchema.safeParse(entrada);
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("processos")
    .insert({ ...colunas(dados.data), escritorio_id: usuario.escritorio_id })
    .select("id")
    .single();
  const linha = z.object({ id: z.uuid() }).safeParse(data);
  if (error || !linha.success) return { erro: mensagemErro(error?.code) };
  revalidatePath("/app/processos");
  return { ok: true, id: linha.data.id };
}

export async function editarProcesso(id: string, entrada: DadosProcesso): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(id).success) return { erro: "Processo não encontrado." };
  const dados = dadosProcessoSchema.safeParse(entrada);
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("processos")
    .update(colunas(dados.data))
    .eq("id", id)
    .select("id");
  if (error || !data?.length) return { erro: mensagemErro(error?.code) };
  revalidatePath(`/app/processos/${id}`);
  revalidatePath("/app/processos");
  return { ok: true, id };
}
