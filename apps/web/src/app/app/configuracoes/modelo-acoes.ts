"use server";

import { ModeloInvalido, validarModelo } from "@tesia/documentos";
import { revalidatePath } from "next/cache";
import { BUCKET_MODELOS, CAMINHO_MODELO, pastaModelo } from "@/lib/modelo-docx";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Resultado = { ok: true } | { erro: string };

export async function salvarModelo(caminho: string): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  if (
    !CAMINHO_MODELO.test(caminho) ||
    !caminho.startsWith(pastaModelo(usuario.escritorio_id, usuario.id))
  ) {
    return { erro: "Arquivo inválido." };
  }
  const supabase = await criarClienteServidor();

  const { data, error } = await supabase.storage.from(BUCKET_MODELOS).download(caminho);
  if (error || !data) return { erro: "Não encontrei o arquivo enviado. Tente de novo." };
  try {
    validarModelo(new Uint8Array(await data.arrayBuffer()));
  } catch (erro) {
    await supabase.storage.from(BUCKET_MODELOS).remove([caminho]);
    return {
      erro:
        erro instanceof ModeloInvalido
          ? "O arquivo não é um .docx válido."
          : "Não consegui ler o modelo.",
    };
  }

  const { error: erroUsuario } = await supabase
    .from("usuarios")
    .update({ modelo_docx_path: caminho })
    .eq("id", usuario.id);
  if (erroUsuario) return { erro: "Não foi possível salvar o modelo." };
  if (usuario.modelo_docx_path && usuario.modelo_docx_path !== caminho) {
    await supabase.storage.from(BUCKET_MODELOS).remove([usuario.modelo_docx_path]);
  }
  revalidatePath("/app/configuracoes");
  return { ok: true };
}

export async function usarModeloPadrao(): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("usuarios")
    .update({ modelo_docx_path: null })
    .eq("id", usuario.id);
  if (error) return { erro: "Não foi possível voltar ao modelo padrão." };
  if (usuario.modelo_docx_path) {
    await supabase.storage.from(BUCKET_MODELOS).remove([usuario.modelo_docx_path]);
  }
  revalidatePath("/app/configuracoes");
  return { ok: true };
}
