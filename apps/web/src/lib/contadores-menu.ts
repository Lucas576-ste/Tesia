import { resumoIntimacoes } from "@/lib/intimacoes";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function contadoresMenu() {
  const supabase = await criarClienteServidor();
  const [intimacoes, { count }] = await Promise.all([
    resumoIntimacoes(),
    supabase
      .from("pecas")
      .select("id", { count: "exact", head: true })
      .eq("status", "rascunho")
      .is("excluido_em", null),
  ]);
  return { intimacoes: intimacoes.pendentes, rascunhos: count ?? 0 };
}
