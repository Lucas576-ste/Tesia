import { z } from "zod";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { Responsavel } from "./termos";

export async function listarResponsaveis(): Promise<Responsavel[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("usuarios").select("id, nome").order("nome");
  const linhas = z.array(z.object({ id: z.uuid(), nome: z.string() })).safeParse(data);
  return linhas.success ? linhas.data : [];
}
