import { z } from "zod";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { montarTermo, termoLinhaSchema, type Responsavel, type Termo } from "./termos";

export async function listarTermos(): Promise<Termo[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("termos_monitorados")
    .select(
      "id, tipo, oab_numero, oab_uf, documento, nome, ufs, status, ultima_sincronizacao_em, ultimo_erro, responsavel_id, usuarios(nome)",
    )
    .order("criado_em");
  const linhas = z.array(termoLinhaSchema).safeParse(data);
  return linhas.success ? linhas.data.map(montarTermo) : [];
}

export async function listarResponsaveis(): Promise<Responsavel[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("usuarios").select("id, nome").order("nome");
  const linhas = z.array(z.object({ id: z.uuid(), nome: z.string() })).safeParse(data);
  return linhas.success ? linhas.data : [];
}
