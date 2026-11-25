"use server";

import { z } from "zod";
import { usuarioAtual } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function marcarNotificacoesLidas(ids: string[]) {
  const usuario = await usuarioAtual();
  const validos = z.array(z.uuid()).max(50).safeParse(ids);
  if (!usuario || !validos.success || validos.data.length === 0) return;
  const supabase = await criarClienteServidor();
  await supabase
    .from("notificacoes")
    .update({ lida_em: new Date().toISOString() })
    .in("id", validos.data)
    .is("lida_em", null);
}
