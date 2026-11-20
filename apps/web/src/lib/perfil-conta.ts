import { z } from "zod";
import { areasPorCodigo } from "@/lib/onboarding";
import type { UsuarioSessao } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type PerfilConta = {
  nome: string;
  email: string;
  oab: string | null;
  uf: string | null;
  areas: string[];
  tribunais: string[];
  whatsapp: string | null;
};

export type ResumoDados = {
  processos: number;
  prazos: number;
  pecas: number;
  pecasEstilo: number;
};

export async function buscarPerfilConta(usuario: UsuarioSessao): Promise<PerfilConta> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("usuarios")
    .select("tribunais")
    .eq("id", usuario.id)
    .maybeSingle();
  const tribunais = z.object({ tribunais: z.array(z.string()) }).safeParse(data).data?.tribunais;
  return {
    nome: usuario.nome,
    email: usuario.email,
    oab: usuario.oab_numero,
    uf: usuario.oab_uf,
    areas: [...areasPorCodigo(usuario.areas)],
    tribunais: tribunais ?? [],
    whatsapp: usuario.whatsapp,
  };
}

export async function buscarResumoDados(): Promise<ResumoDados> {
  const supabase = await criarClienteServidor();
  const contar = async (tabela: "processos" | "prazos" | "pecas" | "estilo_documentos") => {
    const { count } = await supabase.from(tabela).select("id", { count: "exact", head: true });
    return count ?? 0;
  };
  const [processos, prazos, pecas, pecasEstilo] = await Promise.all([
    contar("processos"),
    contar("prazos"),
    contar("pecas"),
    contar("estilo_documentos"),
  ]);
  return { processos, prazos, pecas, pecasEstilo };
}
