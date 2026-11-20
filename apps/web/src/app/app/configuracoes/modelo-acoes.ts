"use server";

import { inspecionarModelo, ModeloInvalido, type InspecaoModelo } from "@tesia/documentos";
import { revalidatePath } from "next/cache";
import { BUCKET_MODELOS, CAMINHO_MODELO, pastaModelo } from "@/lib/modelo-docx";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

type Resultado = { ok: true } | { erro: string };

function nomeSeguro(nome: string) {
  const limpo = [...nome]
    .filter((caractere) => caractere.charCodeAt(0) >= 32)
    .join("")
    .trim()
    .slice(0, 120);
  return limpo || "Timbrado.docx";
}

export async function salvarModelo(caminho: string, nomeArquivo: string): Promise<Resultado> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  if (
    !CAMINHO_MODELO.test(caminho) ||
    !caminho.startsWith(pastaModelo(usuario.escritorio_id, usuario.id))
  ) {
    return { erro: "Arquivo inválido." };
  }
  const supabase = await criarClienteServidor();
  const nome = nomeSeguro(nomeArquivo);
  const temAnterior = usuario.modelo_status === "ativo" && Boolean(usuario.modelo_docx_path);

  if (!temAnterior) {
    await supabase
      .from("usuarios")
      .update({
        modelo_status: "processando",
        modelo_nome: nome,
        modelo_enviado_em: new Date().toISOString(),
        modelo_erro: null,
      })
      .eq("id", usuario.id);
  }

  async function falhar(mensagem: string): Promise<Resultado> {
    await supabase.storage.from(BUCKET_MODELOS).remove([caminho]);
    if (!temAnterior) {
      await supabase
        .from("usuarios")
        .update({ modelo_status: "erro", modelo_erro: mensagem })
        .eq("id", usuario!.id);
    }
    revalidatePath("/app/configuracoes");
    return { erro: mensagem };
  }

  const { data, error } = await supabase.storage.from(BUCKET_MODELOS).download(caminho);
  if (error || !data) return falhar("Não encontramos o arquivo enviado. Tente de novo.");
  try {
    inspecionarModelo(new Uint8Array(await data.arrayBuffer()));
  } catch (erro) {
    return falhar(
      erro instanceof ModeloInvalido
        ? erro.message
        : "Não conseguimos ler este arquivo. Salve-o de novo pelo Word como .docx e envie.",
    );
  }

  const { error: erroUsuario } = await supabase
    .from("usuarios")
    .update({
      modelo_docx_path: caminho,
      modelo_status: "ativo",
      modelo_nome: nome,
      modelo_enviado_em: new Date().toISOString(),
      modelo_erro: null,
    })
    .eq("id", usuario.id);
  if (erroUsuario) return falhar("Não foi possível salvar o timbrado. Tente de novo.");
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
    .update({
      modelo_docx_path: null,
      modelo_status: null,
      modelo_nome: null,
      modelo_enviado_em: null,
      modelo_erro: null,
    })
    .eq("id", usuario.id);
  if (error) return { erro: "Não foi possível remover o timbrado." };
  if (usuario.modelo_docx_path) {
    await supabase.storage.from(BUCKET_MODELOS).remove([usuario.modelo_docx_path]);
  }
  revalidatePath("/app/configuracoes");
  return { ok: true };
}

export async function previaModelo(): Promise<{ previa: InspecaoModelo } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario?.modelo_docx_path) return { erro: "Nenhum timbrado em uso." };
  const supabase = await criarClienteServidor();
  const { data } = await supabase.storage.from(BUCKET_MODELOS).download(usuario.modelo_docx_path);
  if (!data) return { erro: "Não encontramos o arquivo do timbrado." };
  try {
    return { previa: inspecionarModelo(new Uint8Array(await data.arrayBuffer())) };
  } catch {
    return { erro: "Não conseguimos montar a prévia deste arquivo." };
  }
}
