"use server";

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
