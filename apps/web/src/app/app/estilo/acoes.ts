"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  BUCKET_ESTILO,
  MAXIMO_PECAS_ESTILO,
  registroPecaSchema,
  type PecaEstilo,
} from "@/lib/estilo";
import { listarPecasEstilo } from "@/lib/estilo-servidor";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function registrarPecaEstilo(
  caminho: string,
  nome: string,
): Promise<{ id: string } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };

  const resultado = registroPecaSchema.safeParse({ caminho, nome });
  if (!resultado.success || !caminho.startsWith(`${usuario.escritorio_id}/${usuario.id}/`)) {
    return { erro: "Arquivo inválido." };
  }

  const supabase = await criarClienteServidor();
  const { count } = await supabase
    .from("estilo_documentos")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", usuario.id);
  if ((count ?? 0) >= MAXIMO_PECAS_ESTILO) {
    await supabase.storage.from(BUCKET_ESTILO).remove([caminho]);
    return { erro: `O limite é de ${MAXIMO_PECAS_ESTILO} peças.` };
  }

  const { data, error } = await supabase
    .from("estilo_documentos")
    .insert({
      escritorio_id: usuario.escritorio_id,
      usuario_id: usuario.id,
      arquivo_path: caminho,
      nome_arquivo: resultado.data.nome,
      status: "processando",
    })
    .select("id")
    .single();
  const linha = z.object({ id: z.uuid() }).safeParse(data);
  if (error || !linha.success) return { erro: "Não foi possível registrar a peça." };
  return { id: linha.data.id };
}

export async function consultarPecasEstilo(ids: string[]): Promise<PecaEstilo[]> {
  const usuario = await usuarioAtual();
  const resultado = z.array(z.uuid()).max(20).safeParse(ids);
  if (!usuario || !resultado.success || resultado.data.length === 0) return [];
  return listarPecasEstilo(usuario.id, resultado.data);
}

export async function removerPecaEstilo(id: string): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario || !z.uuid().safeParse(id).success) return { erro: "Peça inválida." };

  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("estilo_documentos")
    .select("arquivo_path")
    .eq("id", id)
    .eq("usuario_id", usuario.id)
    .maybeSingle();
  const linha = z.object({ arquivo_path: z.string() }).safeParse(data);
  if (!linha.success) return { erro: "Peça não encontrada." };

  const { error } = await supabase.from("estilo_documentos").delete().eq("id", id);
  if (error) return { erro: "Não foi possível remover a peça." };
  await supabase.storage.from(BUCKET_ESTILO).remove([linha.data.arquivo_path]);
  revalidatePath("/app/estilo");
  return { ok: true };
}

export async function pedirAtualizacaoEstilo(): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const supabase = await criarClienteServidor();
  const { error } = await supabase.rpc("pedir_perfil_estilo");
  if (error) return { erro: "Não foi possível atualizar o estilo agora." };
  revalidatePath("/app/estilo");
  return { ok: true };
}
