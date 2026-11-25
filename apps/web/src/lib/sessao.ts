import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const usuarioSchema = z.object({
  id: z.uuid(),
  escritorio_id: z.uuid(),
  papel: z.enum(["dono", "advogado", "estagiario"]),
  nome: z.string(),
  email: z.string(),
  oab_numero: z.string().nullable(),
  oab_uf: z.string().nullable(),
  areas: z.array(z.string()),
  whatsapp: z.string().nullable(),
  modelo_docx_path: z.string().nullable(),
  modelo_status: z.enum(["processando", "ativo", "erro"]).nullable(),
  modelo_nome: z.string().nullable(),
  modelo_enviado_em: z.string().nullable(),
  modelo_erro: z.string().nullable(),
  calendario_token: z.string(),
  alerta_email: z.boolean(),
  alerta_dias: z.array(z.string()),
  djen_ativo: z.boolean(),
  djen_buscado_ate: z.string().nullable(),
});

export type UsuarioSessao = z.infer<typeof usuarioSchema>;

export const usuarioAtual = cache(async (): Promise<UsuarioSessao | null> => {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: linha } = await supabase
    .from("usuarios")
    .select(
      "id, escritorio_id, papel, nome, email, oab_numero, oab_uf, areas, whatsapp, modelo_docx_path, modelo_status, modelo_nome, modelo_enviado_em, modelo_erro, calendario_token, alerta_email, alerta_dias, djen_ativo, djen_buscado_ate",
    )
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
  const numero = usuario.oab_numero.replace(/\D/g, "");
  const formatado = numero ? Number(numero).toLocaleString("pt-BR") : usuario.oab_numero;
  return `OAB/${usuario.oab_uf ?? ""} ${formatado}`;
}
