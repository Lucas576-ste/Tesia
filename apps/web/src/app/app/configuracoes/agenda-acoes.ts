"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TOKEN_AGENDA } from "@/lib/agenda";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function gerarNovoLinkAgenda(): Promise<{ token: string } | { erro: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.rpc("gerar_novo_link_agenda");
  const token = z.string().regex(TOKEN_AGENDA).safeParse(data);
  if (error || !token.success) return { erro: "Não foi possível gerar um novo link." };
  revalidatePath("/app/configuracoes");
  return { token: token.data };
}
