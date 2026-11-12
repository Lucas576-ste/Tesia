import { analiseGravadaSchema, memoriaCalculoSchema, nomePartes } from "@tesia/shared";
import { z } from "zod";
import { hojeEmBrasilia } from "@/lib/datas-servidor";
import { STATUS_INTIMACAO } from "@/lib/envio-intimacao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type TrechoDocumento = { id: string; texto: string };

export type PrazoAnalise = {
  vencimentoIso: string;
  sugeridoIso: string;
  inicioIso: string | null;
  internoIso: string | null;
  dias: number;
  contagem: string;
  fundamento: string;
  memoria: string[];
  regraRevisada: boolean;
};

export type Analise = {
  id: string;
  cnj: string;
  orgao: string;
  partes: string;
  resumo: string;
  pontos: { titulo: string; explicacao?: string; trechoId: string | null }[];
  prazo: PrazoAnalise | null;
  motivoSemPrazo: string | null;
  confirmado: boolean;
  pecas: { nome: string; justificativa: string }[];
  documento: TrechoDocumento[];
  hoje: string;
};

export type EstadoIntimacao =
  { status: "recebida" | "processando" | "erro" } | { status: "analisada"; analise: Analise };

const linhaSchema = z.object({
  id: z.uuid(),
  status: z.enum(STATUS_INTIMACAO),
  texto: z.string().nullable(),
  extracao: z.unknown(),
});

const prazoSchema = z.object({
  status: z.enum(["sugerido", "confirmado", "cumprido", "perdido", "descartado"]),
  dias: z.number().nullable(),
  contagem: z.enum(["uteis", "corridos"]).nullable(),
  data_inicio: z.string().nullable(),
  data_vencimento: z.string(),
  data_vencimento_sugerida: z.string().nullable(),
  data_prazo_interno: z.string().nullable(),
  memoria_calculo: z.unknown(),
});

function normalizar(texto: string) {
  return texto.toLocaleLowerCase("pt-BR").replace(/\s+/g, " ").trim();
}

export function dividirDocumento(texto: string): TrechoDocumento[] {
  return texto
    .split(/\n+/)
    .map((paragrafo) => paragrafo.trim())
    .filter(Boolean)
    .map((paragrafo, indice) => ({ id: `p${indice}`, texto: paragrafo }));
}

export function acharTrecho(documento: TrechoDocumento[], trecho: string) {
  const alvo = normalizar(trecho);
  const inicio = alvo.slice(0, 40);
  const encontrado =
    documento.find((paragrafo) => normalizar(paragrafo.texto).includes(alvo)) ??
    documento.find((paragrafo) => normalizar(paragrafo.texto).includes(inicio));
  return encontrado?.id ?? null;
}

function montarPrazo(
  linha: z.infer<typeof prazoSchema> | undefined,
  gravado: z.infer<typeof analiseGravadaSchema>["prazo"],
): PrazoAnalise | null {
  if (!linha) return null;
  const memoria = memoriaCalculoSchema.safeParse(linha.memoria_calculo);
  return {
    vencimentoIso: linha.data_vencimento,
    sugeridoIso: linha.data_vencimento_sugerida ?? linha.data_vencimento,
    inicioIso: linha.data_inicio,
    internoIso: linha.data_prazo_interno,
    dias: linha.dias ?? gravado?.dias ?? 0,
    contagem: (linha.contagem ?? gravado?.contagem) === "corridos" ? "corridos" : "úteis",
    fundamento: gravado?.fundamento ?? "",
    memoria: memoria.success ? memoria.data.linhas : [],
    regraRevisada: memoria.success
      ? memoria.data.regra_revisada
      : (gravado?.regra_revisada ?? false),
  };
}

export async function buscarIntimacao(id: string): Promise<EstadoIntimacao | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("intimacoes")
    .select("id, status, texto, extracao")
    .eq("id", id)
    .is("excluido_em", null)
    .maybeSingle();
  const linha = linhaSchema.safeParse(data);
  if (!linha.success) return null;
  if (linha.data.status !== "analisada") return { status: linha.data.status };

  const gravada = analiseGravadaSchema.safeParse(linha.data.extracao);
  if (!gravada.success) return { status: "erro" };

  const { data: prazos } = await supabase
    .from("prazos")
    .select(
      "status, dias, contagem, data_inicio, data_vencimento, data_vencimento_sugerida, data_prazo_interno, memoria_calculo",
    )
    .eq("intimacao_id", id)
    .in("status", ["sugerido", "confirmado", "cumprido"])
    .order("criado_em", { ascending: false })
    .limit(1);
  const prazo = z.array(prazoSchema).safeParse(prazos).data?.[0];

  const { dados, resumo, pecas } = gravada.data;
  const documento = dividirDocumento(linha.data.texto ?? "");
  const pontos = resumo.pontos_ataque.length
    ? resumo.pontos_ataque
    : dados.pontos.map((ponto) => ({ ...ponto, explicacao: undefined }));

  return {
    status: "analisada",
    analise: {
      id,
      cnj: dados.numero_processo ?? "Número não identificado",
      orgao: [dados.orgao, dados.tribunal].filter(Boolean).join(" · ") || "Órgão não identificado",
      partes: nomePartes(dados.partes),
      resumo: resumo.o_que_aconteceu,
      pontos: pontos.map(({ titulo, explicacao, trecho }) => ({
        titulo,
        explicacao,
        trechoId: acharTrecho(documento, trecho),
      })),
      prazo: montarPrazo(prazo, gravada.data.prazo),
      motivoSemPrazo: gravada.data.motivo_sem_prazo,
      confirmado: prazo?.status === "confirmado" || prazo?.status === "cumprido",
      pecas: pecas.map(({ nome, justificativa }) => ({ nome, justificativa })),
      documento,
      hoje: hojeEmBrasilia(),
    },
  };
}
