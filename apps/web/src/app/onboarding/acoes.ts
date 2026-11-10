"use server";

import { usuarioAtual } from "@/lib/sessao";
import { CODIGO_AREA, perfilSchema, type Perfil } from "@/lib/onboarding";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function salvarPerfil(perfil: Perfil): Promise<{ erro?: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };

  const resultado = perfilSchema.safeParse(perfil);
  if (!resultado.success) return { erro: "Confira os dados informados." };

  const { oab, uf, areas, whatsapp } = resultado.data;
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("usuarios")
    .update({
      oab_numero: oab,
      oab_uf: uf,
      areas: areas.map((area) => CODIGO_AREA[area]),
      whatsapp: whatsapp.replace(/\D/g, "") || null,
    })
    .eq("id", usuario.id);

  return error ? { erro: "Não foi possível salvar agora. Tente de novo." } : {};
}
