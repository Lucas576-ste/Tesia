import { z } from "zod";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const totalSchema = z.array(z.object({ total: z.coerce.number() }));

async function contar(aguardando: boolean) {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.rpc("listar_intimacoes", {
    p_aguardando: aguardando,
    p_pagina: 1,
    p_tamanho: 1,
  });
  return totalSchema.safeParse(data).data?.[0]?.total ?? 0;
}

export async function resumoIntimacoes() {
  const [total, pendentes] = await Promise.all([contar(false), contar(true)]);
  return { total, pendentes };
}
