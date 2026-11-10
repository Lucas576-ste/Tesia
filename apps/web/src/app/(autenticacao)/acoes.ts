"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  cadastroSchema,
  destinoSeguro,
  loginSchema,
  mensagemErroAutenticacao,
  novaSenhaSchema,
  primeiroErro,
  recuperacaoSchema,
  type EstadoFormulario,
} from "@/lib/autenticacao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

async function origemDoSite() {
  const cabecalhos = await headers();
  const origem = cabecalhos.get("origin");
  if (origem) return origem;
  const protocolo = cabecalhos.get("x-forwarded-proto") ?? "https";
  return `${protocolo}://${cabecalhos.get("host")}`;
}

function linkDeRetorno(origem: string, proximo: string) {
  return `${origem}/auth/callback?proximo=${encodeURIComponent(proximo)}`;
}

export async function cadastrar(
  _estado: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const email = String(dados.get("email") ?? "");
  const resultado = cadastroSchema.safeParse(Object.fromEntries(dados));
  if (!resultado.success) return { erro: primeiroErro(resultado.error), email };

  const { nome, senha } = resultado.data;
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email: resultado.data.email,
    password: senha,
    options: {
      emailRedirectTo: linkDeRetorno(await origemDoSite(), "/onboarding/perfil"),
      data: { nome, termos_aceitos: true },
    },
  });

  if (error) return { erro: mensagemErroAutenticacao(error.code), email };
  if (data.session) redirect("/onboarding/perfil");
  return {
    sucesso: `Enviamos um link de confirmação para ${resultado.data.email}. Abra o e-mail para ativar a conta.`,
    email,
  };
}

export async function entrar(
  _estado: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const email = String(dados.get("email") ?? "");
  const resultado = loginSchema.safeParse(Object.fromEntries(dados));
  if (!resultado.success) return { erro: primeiroErro(resultado.error), email };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: resultado.data.email,
    password: resultado.data.senha,
  });

  if (error) return { erro: mensagemErroAutenticacao(error.code), email };
  redirect(destinoSeguro(resultado.data.proximo));
}

export async function enviarRecuperacao(
  _estado: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const email = String(dados.get("email") ?? "");
  const resultado = recuperacaoSchema.safeParse(Object.fromEntries(dados));
  if (!resultado.success) return { erro: primeiroErro(resultado.error), email };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.resetPasswordForEmail(resultado.data.email, {
    redirectTo: linkDeRetorno(await origemDoSite(), "/recuperar-senha/nova"),
  });

  if (error?.code?.startsWith("over_")) {
    return { erro: mensagemErroAutenticacao(error.code), email };
  }
  return {
    sucesso: "Se houver uma conta com este e-mail, você vai receber o link em alguns minutos.",
    email,
  };
}

export async function salvarNovaSenha(
  _estado: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const resultado = novaSenhaSchema.safeParse(Object.fromEntries(dados));
  if (!resultado.success) return { erro: primeiroErro(resultado.error) };

  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { erro: "O link expirou. Peça um novo na tela de recuperar senha." };

  const { error } = await supabase.auth.updateUser({ password: resultado.data.senha });
  if (error) return { erro: mensagemErroAutenticacao(error.code) };
  redirect("/app");
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
