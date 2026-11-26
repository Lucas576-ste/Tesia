import { SELECAO_DOS_PRAZOS } from "@/lib/consulta-prazos";
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
  partes: z.string().nullable(),
});

const linhaPrazoSchema = z.object({
  id: z.uuid(),
  automatica: z.boolean(),
  intimacao_id: z.uuid().nullable(),
  processo_id: z.uuid().nullable(),
  origem: z.enum(["intimacao", "manual"]),
  tipo: z.enum(["prazo", "audiencia", "compromisso"]),
  hora: z.string().nullable(),
  descricao: z.string(),
  data_inicio: z.string().nullable(),
  data_vencimento: z.string(),
  data_prazo_interno: z.string().nullable(),
  processos: umOuNenhum(processoSchema),
  intimacoes: umOuNenhum(z.object({ extracao: z.unknown() })),
  status: z.enum(["confirmado", "cumprido"]),
  pecas: z
    .array(
      z.object({
        id: z.uuid(),
        status: z.string(),
        criado_em: z.string(),
        excluido_em: z.string().nullable(),
      }),
    )
    .nullable(),
});

function pecaDoPrazo(linha: z.infer<typeof linhaPrazoSchema>) {
  return (linha.pecas ?? [])
    .filter(
      (peca) => !peca.excluido_em && ["rascunho", "revisada", "protocolada"].includes(peca.status),
    )
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em))[0];
}

function statusDoPrazo(linha: z.infer<typeof linhaPrazoSchema>): LinhaPrazo["status"] {
  const peca = pecaDoPrazo(linha);
  if (linha.status === "cumprido" || peca?.status === "protocolada") return "protocolado";
  return peca ? "rascunho_pronto" : "nao_iniciado";
}

export function rotuloArea(codigo: string | null | undefined) {
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
  return processo?.partes ?? processo?.parte_contraria ?? "Sem processo";
}

export async function listarPrazosConfirmados(
  processoId?: string,
  { comAutomaticas = false }: { comAutomaticas?: boolean } = {},
): Promise<LinhaPrazo[]> {
  const supabase = await criarClienteServidor();
  let consulta = supabase
    .from("prazos")
    .select(SELECAO_DOS_PRAZOS)
    .in("status", ["confirmado", "cumprido"])
    .order("data_vencimento");
  if (processoId) consulta = consulta.eq("processo_id", processoId);
  if (!comAutomaticas) consulta = consulta.eq("automatica", false);
  const { data, error } = await consulta;
  if (error) throw new Error(`Falha ao ler os prazos: ${error.message}`);
  const linhas = z.array(linhaPrazoSchema).safeParse(data);
  if (!linhas.success) throw new Error("Os prazos vieram em um formato inesperado.");
  const hoje = hojeEmBrasilia();

  return linhas.data.map((linha) => ({
    id: linha.intimacao_id ?? linha.id,
    prazoId: linha.id,
    ...(linha.automatica && { automatica: true }),
    ...(linha.origem === "manual" && { tipo: linha.tipo, hora: linha.hora?.slice(0, 5) }),
    partes: partesDaIntimacao(linha.intimacoes?.extracao, linha.processos),
    cnj: linha.processos?.numero_cnj ?? "Sem número",
    peca: linha.descricao,
    area: rotuloArea(linha.processos?.area),
    vencimento: isoParaData(linha.data_vencimento),
    inicio: linha.data_inicio ? isoParaData(linha.data_inicio) : undefined,
    prazoInterno: linha.data_prazo_interno ? isoParaData(linha.data_prazo_interno) : undefined,
    diasUteis: diasUteisAte(linha.data_vencimento, hoje),
    diasAtraso: Math.max(
      0,
      Math.round(
        (Date.parse(`${hoje}T00:00:00Z`) - Date.parse(`${linha.data_vencimento}T00:00:00Z`)) /
          86_400_000,
      ),
    ),
    status:
      linha.origem === "manual" && linha.status === "cumprido"
        ? "protocolado"
        : statusDoPrazo(linha),
    pecaId: pecaDoPrazo(linha)?.id,
  }));
}

export async function listarProcessosResumo(): Promise<ProcessoResumo[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("processos")
    .select("id, numero_cnj, area, parte_contraria, partes")
    .is("excluido_em", null)
    .order("criado_em", { ascending: false });
  const linhas = z.array(processoSchema).safeParse(data);
  if (!linhas.success) return [];
  return linhas.data.map((processo) => ({
    id: processo.id,
    cnj: processo.numero_cnj,
    partes: processo.partes ?? processo.parte_contraria ?? processo.numero_cnj,
    area: rotuloArea(processo.area),
  }));
}
