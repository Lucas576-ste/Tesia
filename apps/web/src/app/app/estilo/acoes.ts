"use server";

import { idAprendizado, PARTES_APRENDIZADO, perfilGravadoSchema } from "@tesia/shared";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  BUCKET_ESTILO,
  MAXIMO_PECAS_ESTILO,
  registroPecaSchema,
  type PecaEstilo,
} from "@/lib/estilo";
import {
  buscarExemplo,
  listarPecasEstilo,
  SEM_EXEMPLO,
  type EstadoExemplo,
} from "@/lib/estilo-servidor";
import { limitar, MENSAGEM_LIMITE } from "@/lib/limite";
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

const avaliacaoSchema = z.object({
  parte: z.enum(PARTES_APRENDIZADO),
  texto: z.string().min(1).max(400),
  avaliacao: z.enum(["certo", "errado"]),
  correcao: z.string().trim().max(500).optional(),
});

async function perfilDoUsuario(usuarioId: string) {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("perfis_estilo")
    .select("guia")
    .eq("usuario_id", usuarioId)
    .maybeSingle();
  return perfilGravadoSchema.safeParse(data?.guia).data ?? null;
}

export async function avaliarAprendizado(
  entrada: z.input<typeof avaliacaoSchema>,
): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const resultado = avaliacaoSchema.safeParse(entrada);
  if (!resultado.success) return { erro: "Avaliação inválida." };
  const { parte, texto, avaliacao, correcao } = resultado.data;

  const perfil = await perfilDoUsuario(usuario.id);
  const existe = perfil?.aprendizados.some(
    (grupo) => grupo.parte === parte && grupo.itens.includes(texto),
  );
  if (!existe) return { erro: "Esse item não está mais no seu estilo. Atualize a página." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("estilo_correcoes").upsert(
    {
      escritorio_id: usuario.escritorio_id,
      usuario_id: usuario.id,
      item_id: idAprendizado(parte, texto),
      parte,
      texto_item: texto,
      avaliacao,
      correcao: avaliacao === "errado" && correcao ? correcao : null,
      criado_em: new Date().toISOString(),
      aplicada_em: null,
    },
    { onConflict: "usuario_id,item_id" },
  );
  if (error) return { erro: "Não foi possível salvar sua resposta." };
  revalidatePath("/app/estilo");
  return { ok: true };
}

export async function pedirExemplo(): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  if (!(await limitar(`exemplo-estilo:${usuario.id}`, 20, 3600))) return { erro: MENSAGEM_LIMITE };
  const supabase = await criarClienteServidor();
  const { error } = await supabase.rpc("pedir_exemplo_estilo");
  if (error) return { erro: "Não foi possível gerar o exemplo agora. Tente de novo." };
  return { ok: true };
}

export async function consultarExemplo(): Promise<EstadoExemplo> {
  const usuario = await usuarioAtual();
  return usuario ? buscarExemplo(usuario.id) : SEM_EXEMPLO;
}

export async function alternarAprendizadoContinuo(
  ligado: boolean,
): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("usuarios")
    .update({ estilo_aprender_revisoes: ligado })
    .eq("id", usuario.id);
  if (error) return { erro: "Não foi possível salvar a opção." };
  revalidatePath("/app/estilo");
  return { ok: true };
}
