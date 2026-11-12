import { analiseGravadaSchema, nomePartes } from "@tesia/shared";
import { z } from "zod";
import { diasUteisAte, hojeEmBrasilia } from "@/lib/datas-servidor";
import { areasPorCodigo, AREAS_ATUACAO, CODIGO_AREA } from "@/lib/onboarding";
import type { LinhaPrazo } from "@/lib/prazo";
import type { ProcessoResumo } from "@/lib/prazo-manual";
import { isoParaData } from "@/lib/prazo-interno";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const umOuNenhum = <T extends z.ZodType>(schema: T) =>
  z
    .union([schema, z.array(schema)])
    .nullable()
    .transform((valor) => (Array.isArray(valor) ? (valor[0] ?? null) : valor));

const processoSchema = z.object({
  id: z.uuid(),
  numero_cnj: z.string(),
  area: z.string().nullable(),
  parte_contraria: z.string().nullable(),
});

const linhaPrazoSchema = z.object({
  id: z.uuid(),
  intimacao_id: z.uuid().nullable(),
  descricao: z.string(),
  data_inicio: z.string().nullable(),
  data_vencimento: z.string(),
  data_prazo_interno: z.string().nullable(),
  processos: umOuNenhum(processoSchema),
  intimacoes: umOuNenhum(z.object({ extracao: z.unknown() })),
});

function rotuloArea(codigo: string | null | undefined) {
  if (!codigo) return "Sem área";
  return (
    areasPorCodigo([codigo])[0] ??
    AREAS_ATUACAO.find((area) => CODIGO_AREA[area] === codigo) ??
    codigo
  );
}

function partesDaIntimacao(extracao: unknown, processo: z.infer<typeof processoSchema> | null) {
  const analise = analiseGravadaSchema.safeParse(extracao);
  if (analise.success) return nomePartes(analise.data.dados.partes);
  return processo?.parte_contraria ?? "Partes não identificadas";
}

export async function listarPrazosConfirmados(): Promise<LinhaPrazo[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("prazos")
    .select(
      "id, intimacao_id, descricao, data_inicio, data_vencimento, data_prazo_interno, processos(id, numero_cnj, area, parte_contraria), intimacoes(extracao)",
    )
    .eq("status", "confirmado")
    .eq("tipo", "prazo")
    .order("data_vencimento");
  const linhas = z.array(linhaPrazoSchema).safeParse(data);
  if (!linhas.success) return [];
  const hoje = hojeEmBrasilia();

  return linhas.data.map((linha) => ({
    id: linha.intimacao_id ?? linha.id,
    partes: partesDaIntimacao(linha.intimacoes?.extracao, linha.processos),
    cnj: linha.processos?.numero_cnj ?? "Sem número",
    peca: linha.descricao,
    area: rotuloArea(linha.processos?.area),
    vencimento: isoParaData(linha.data_vencimento),
    inicio: linha.data_inicio ? isoParaData(linha.data_inicio) : undefined,
    prazoInterno: linha.data_prazo_interno ? isoParaData(linha.data_prazo_interno) : undefined,
    diasUteis: diasUteisAte(linha.data_vencimento, hoje),
    status: "nao_iniciado",
  }));
}

export async function listarProcessosResumo(): Promise<ProcessoResumo[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("processos")
    .select("id, numero_cnj, area, parte_contraria")
    .is("excluido_em", null)
    .order("criado_em", { ascending: false });
  const linhas = z.array(processoSchema).safeParse(data);
  if (!linhas.success) return [];
  return linhas.data.map((processo) => ({
    id: processo.id,
    cnj: processo.numero_cnj,
    partes: processo.parte_contraria ?? processo.numero_cnj,
    area: rotuloArea(processo.area),
  }));
}
