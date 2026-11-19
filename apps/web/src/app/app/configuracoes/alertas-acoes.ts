"use server";

import { revalidatePath } from "next/cache";
import { preferenciasAlertaSchema, type PreferenciasAlerta } from "@/lib/alertas";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function salvarAlertas(
  entrada: PreferenciasAlerta,
): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const dados = preferenciasAlertaSchema.safeParse(entrada);
  if (!dados.success) return { erro: "Escolha opções válidas." };
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("usuarios")
    .update({ alerta_email: dados.data.email, alerta_dias: [...new Set(dados.data.dias)] })
    .eq("id", usuario.id);
  if (error) return { erro: "Não foi possível salvar os alertas." };
  revalidatePath("/app/configuracoes");
  return { ok: true };
}

export async function salvarDjen(ativo: boolean): Promise<{ ok: true } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  if (ativo && (!usuario.oab_numero || !usuario.oab_uf))
    return { erro: "Cadastre sua OAB no perfil antes de ligar a busca." };
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("usuarios")
    .update({ djen_ativo: ativo })
    .eq("id", usuario.id);
  if (error) return { erro: "Não foi possível salvar." };
  revalidatePath("/app/configuracoes");
  return { ok: true };
}
