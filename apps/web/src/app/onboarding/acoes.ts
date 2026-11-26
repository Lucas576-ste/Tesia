"use server";

import { podeGerenciarTermos } from "@tesia/shared";
import { revalidatePath } from "next/cache";
import { lerOabDaBusca } from "@/lib/busca-oab";
import { encerrarBuscaDaOab } from "@/lib/busca-oab-servidor";
import { usuarioAtual } from "@/lib/sessao";
import { CODIGO_AREA, perfilSchema, type Perfil } from "@/lib/onboarding";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function salvarPerfil(perfil: Perfil): Promise<{ erro?: string }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sua sessão expirou. Entre de novo." };

  const resultado = perfilSchema.safeParse(perfil);
  if (!resultado.success) return { erro: "Confira os dados informados." };

  const { nome, oab, uf, areas, tribunais, whatsapp } = resultado.data;
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("usuarios")
    .update({
      ...(nome ? { nome } : {}),
      tribunais,
      oab_numero: oab,
      oab_uf: uf,
      areas: areas.map((area) => CODIGO_AREA[area]),
      whatsapp: whatsapp.replace(/\D/g, "") || null,
    })
    .eq("id", usuario.id);

  if (error) return { erro: "Não foi possível salvar agora. Tente de novo." };

  const oabAntiga = lerOabDaBusca(usuario.oab_numero, usuario.oab_uf);
  const oabNova = lerOabDaBusca(oab, uf);
  const trocouOab = oabAntiga?.numero !== oabNova?.numero || oabAntiga?.uf !== oabNova?.uf;
  if (podeGerenciarTermos(usuario.papel) && usuario.busca_oab_aceita_em && trocouOab) {
    await encerrarBuscaDaOab(usuario, oabAntiga);
  }
  revalidatePath("/app/configuracoes");
  revalidatePath("/app/intimacoes");
  return {};
}
