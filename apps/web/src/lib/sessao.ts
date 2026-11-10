import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const usuarioSchema = z.object({
  id: z.uuid(),
  escritorio_id: z.uuid(),
  nome: z.string(),
  email: z.string(),
  oab_numero: z.string().nullable(),
  oab_uf: z.string().nullable(),
  areas: z.array(z.string()),
  whatsapp: z.string().nullable(),
});

export type UsuarioSessao = z.infer<typeof usuarioSchema>;

export const usuarioAtual = cache(async (): Promise<UsuarioSessao | null> => {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: linha } = await supabase
    .from("usuarios")
    .select("id, escritorio_id, nome, email, oab_numero, oab_uf, areas, whatsapp")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  const resultado = usuarioSchema.safeParse(linha);
  return resultado.success ? resultado.data : null;
});

export async function exigirUsuario() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/auth/sair");
  return usuario;
}

export function rotuloOab(usuario: UsuarioSessao) {
  if (!usuario.oab_numero) return "OAB pendente";
  return `OAB/${usuario.oab_uf ?? ""} ${usuario.oab_numero}`;
}
