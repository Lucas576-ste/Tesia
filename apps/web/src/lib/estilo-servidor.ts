import { z } from "zod";
import { STATUS_PECA_ESTILO, type PecaEstilo } from "@/lib/estilo";
import { isoParaData } from "@/lib/prazo-interno";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const linhaSchema = z.object({
  id: z.uuid(),
  nome_arquivo: z.string(),
  criado_em: z.string(),
  status: z.enum(STATUS_PECA_ESTILO),
  estilo_trechos: z.array(z.object({ count: z.number() })),
});

function dataEmBrasilia(iso: string) {
  return isoParaData(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso)),
  );
}

export function paraPecaEstilo(linha: z.infer<typeof linhaSchema>): PecaEstilo {
  return {
    id: linha.id,
    nome: linha.nome_arquivo || "Peça sem nome",
    data: dataEmBrasilia(linha.criado_em),
    status: linha.status,
    trechos: linha.estilo_trechos[0]?.count ?? 0,
  };
}

export const SELECAO_PECA_ESTILO = "id, nome_arquivo, criado_em, status, estilo_trechos(count)";

export async function listarPecasEstilo(usuarioId: string, ids?: string[]): Promise<PecaEstilo[]> {
  const supabase = await criarClienteServidor();
  let consulta = supabase
    .from("estilo_documentos")
    .select(SELECAO_PECA_ESTILO)
    .eq("usuario_id", usuarioId)
    .order("criado_em");
  if (ids) consulta = consulta.in("id", ids);
  const { data } = await consulta;
  const linhas = z.array(linhaSchema).safeParse(data);
  return linhas.success ? linhas.data.map(paraPecaEstilo) : [];
}
