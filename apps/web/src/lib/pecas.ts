import { analiseGravadaSchema, nomePartes } from "@tesia/shared";
import { z } from "zod";
import type { LinhaPeca } from "@/lib/linha-peca";
import { areasPorCodigo } from "@/lib/onboarding";
import { isoParaData } from "@/lib/prazo-interno";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const umOuNenhum = <T extends z.ZodType>(schema: T) =>
  z
    .union([schema, z.array(schema)])
    .nullable()
    .transform((valor) => (Array.isArray(valor) ? (valor[0] ?? null) : valor));

const linhaSchema = z.object({
  id: z.uuid(),
  titulo: z.string(),
  status: z.enum(["gerando", "rascunho", "revisada", "protocolada", "erro"]),
  processo_id: z.uuid().nullable(),
  criado_em: z.string(),
  tipos_peca: umOuNenhum(z.object({ nome: z.string(), area: z.string() })),
  processos: umOuNenhum(z.object({ numero_cnj: z.string(), area: z.string().nullable() })),
  prazos: umOuNenhum(z.object({ data_vencimento: z.string() })),
  intimacoes: umOuNenhum(z.object({ extracao: z.unknown() })),
});

function dataEmBrasilia(iso: string) {
  return isoParaData(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso)),
  );
}

export async function listarPecasEscritorio(): Promise<LinhaPeca[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("pecas")
    .select(
      "id, titulo, status, processo_id, criado_em, tipos_peca(nome, area), processos(numero_cnj, area), prazos(data_vencimento), intimacoes(extracao)",
    )
    .is("excluido_em", null)
    .in("status", ["rascunho", "revisada", "protocolada"])
    .order("criado_em", { ascending: false })
    .limit(300);
  const linhas = z.array(linhaSchema).safeParse(data);
  if (!linhas.success) return [];

  return linhas.data.map((peca) => {
    const analise = analiseGravadaSchema.safeParse(peca.intimacoes?.extracao);
    const codigoArea =
      peca.processos?.area ?? analise.data?.dados.area ?? peca.tipos_peca?.area ?? "";
    return {
      id: peca.id,
      processoId: peca.processo_id ?? "",
      tipo: peca.tipos_peca?.nome ?? peca.titulo,
      area: areasPorCodigo([codigoArea])[0] ?? "Geral",
      data: dataEmBrasilia(peca.criado_em),
      status: peca.status === "protocolada" ? "protocolado" : "rascunho_pronto",
      partes: analise.success ? nomePartes(analise.data.dados.partes) : peca.titulo,
      cnj: peca.processos?.numero_cnj ?? "Sem número",
      vencimento: peca.prazos ? isoParaData(peca.prazos.data_vencimento) : null,
    };
  });
}
