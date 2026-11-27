import {
  analiseGravadaSchema,
  htmlParaTexto,
  memoriaCalculoSchema,
  nomePartes,
} from "@tesia/shared";
import { z } from "zod";
import { hojeEmBrasilia } from "@/lib/datas-servidor";
import { montarCobertura, type Cobertura } from "@/lib/cobertura-calendario";
import { STATUS_INTIMACAO } from "@/lib/envio-intimacao";
import { valorDeFiltro } from "@/lib/filtro-postgrest";
import { avisoDoPrazoCitado } from "@/lib/prazo-no-texto";
import {
  acharTrecho,
  dividirDocumento,
  type Grifo,
  type TrechoDocumento,
} from "@/lib/formatar-publicacao";
import type { CalendarioPrazo, FormaRecebimento, RegraPrazo } from "@/lib/recalculo-prazo";
import { criarClienteServidor } from "@/lib/supabase/servidor";

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
  pontos: { titulo: string; explicacao?: string; trecho: string; grifos: Grifo[] }[];
  resultado: string | null;
  tipoAto: string;
  partesDetalhadas: { nome: string; polo: "ativo" | "passivo" | null; cliente: boolean }[];
  prazo: PrazoAnalise | null;
  motivoSemPrazo: string | null;
  confirmado: boolean;
  concluida: boolean;
  processoId: string | null;
  pecas: { codigo: string; nome: string; justificativa: string }[];
  documento: TrechoDocumento[];
  textoOriginal: string;
  avisoPrazo: string | null;
  hoje: string;
  recebimento: { forma: FormaRecebimento; disponibilizacao: string; envio: string };
  regra: RegraPrazo | null;
  calendario: CalendarioComCobertura;
};

export type CalendarioComCobertura = CalendarioPrazo & { cobertura: Cobertura };

export type EstadoIntimacao =
  { status: "recebida" | "processando" | "erro" } | { status: "analisada"; analise: Analise };

const linhaSchema = z.object({
  id: z.uuid(),
  status: z.enum(STATUS_INTIMACAO),
  texto: z.string().nullable(),
  concluida_em: z.string().nullable(),
  processo_id: z.uuid().nullable(),
  extracao: z.unknown(),
  processos: z
    .union([
      z.object({
        tribunal: z.string().nullable(),
        uf: z.string().nullable(),
        municipio: z.string().nullable(),
      }),
      z.array(
        z.object({
          tribunal: z.string().nullable(),
          uf: z.string().nullable(),
          municipio: z.string().nullable(),
        }),
      ),
    ])
    .nullable()
    .transform((valor) => (Array.isArray(valor) ? (valor[0] ?? null) : valor)),
});

const feriadosSchema = z.array(
  z.object({
    data: z.string(),
    nome: z.string(),
    abrangencia: z.string(),
    municipio: z.string().nullable(),
    tribunal: z.string().nullable(),
    escritorio_id: z.uuid().nullable(),
  }),
);
const suspensoesSchema = z.array(
  z.object({
    inicio: z.string(),
    fim: z.string(),
    motivo: z.string(),
    tribunal: z.string().nullable(),
    escritorio_id: z.uuid().nullable(),
  }),
);

type SupabaseServidor = Awaited<ReturnType<typeof criarClienteServidor>>;

export async function buscarCalendario(
  supabase: SupabaseServidor,
  local: { tribunal: string | null; uf: string | null; municipio: string | null } | null,
  rito: string,
): Promise<CalendarioComCobertura> {
  const recessoCivil = rito !== "criminal";
  const tribunal = local?.tribunal ? valorDeFiltro(local.tribunal) : null;
  const filtros = ["and(escritorio_id.not.is.null,tribunal.is.null)"];
  if (tribunal) filtros.push(`and(abrangencia.eq.tribunal,tribunal.eq.${tribunal})`);
  if (local?.uf) filtros.push(`and(abrangencia.in.(estadual,municipal),uf.eq.${local.uf})`);
  const { data: feriados } = await supabase
    .from("feriados")
    .select("data, nome, abrangencia, municipio, tribunal, escritorio_id")
    .or(filtros.join(","));
  const municipio = local?.municipio?.toLocaleLowerCase("pt-BR");
  const lista = (feriadosSchema.safeParse(feriados).data ?? []).filter(
    (feriado) =>
      feriado.abrangencia !== "municipal" ||
      feriado.municipio?.toLocaleLowerCase("pt-BR") === municipio,
  );

  const filtrosSuspensao = ["and(escritorio_id.not.is.null,tribunal.is.null)"];
  if (tribunal) filtrosSuspensao.push(`tribunal.eq.${tribunal}`);
  const { data: suspensoes } = await supabase
    .from("suspensoes_tribunal")
    .select("inicio:data_inicio, fim:data_fim, motivo, tribunal, escritorio_id")
    .or(filtrosSuspensao.join(","));
  const periodos = suspensoesSchema.safeParse(suspensoes).data ?? [];
  return {
    feriados: lista.map(({ data, nome }) => ({ data, nome })),
    suspensoes: periodos.map(({ inicio, fim, motivo }) => ({ inicio, fim, motivo })),
    recessoCivil,
    cobertura: montarCobertura(local?.tribunal ?? null, lista, periodos),
  };
}

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
    .select(
      "id, status, texto, concluida_em, processo_id, extracao, processos(tribunal, uf, municipio)",
    )
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
  const regraGravada = gravada.data.prazo;
  const calendario = await buscarCalendario(supabase, linha.data.processos, dados.rito);
  const forma: FormaRecebimento =
    dados.forma_intimacao === "portal" || dados.forma_intimacao === "citacao"
      ? dados.forma_intimacao
      : "diario";
  const textoOriginal = htmlParaTexto(linha.data.texto ?? "");
  const documento = dividirDocumento(textoOriginal);
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
      resultado: dados.resultado,
      tipoAto: dados.tipo_ato,
      partesDetalhadas: dados.partes.map(({ nome, polo }) => ({
        nome,
        polo,
        cliente: polo !== null && polo === dados.polo_cliente,
      })),
      pontos: pontos.map(({ titulo, explicacao, trecho }) => ({
        titulo,
        explicacao,
        trecho,
        grifos: acharTrecho(documento, trecho),
      })),
      prazo: montarPrazo(prazo, gravada.data.prazo),
      motivoSemPrazo: gravada.data.motivo_sem_prazo,
      confirmado: prazo?.status === "confirmado" || prazo?.status === "cumprido",
      concluida: linha.data.concluida_em !== null,
      processoId: linha.data.processo_id,
      pecas: pecas.map(({ codigo, nome, justificativa }) => ({ codigo, nome, justificativa })),
      documento,
      textoOriginal,
      avisoPrazo: avisoDoPrazoCitado(textoOriginal, regraGravada?.dias ?? null),
      hoje: hojeEmBrasilia(),
      recebimento: {
        forma,
        disponibilizacao: dados.data_disponibilizacao ?? "",
        envio:
          dados.data_envio_portal ??
          (forma === "portal" ? (dados.data_disponibilizacao ?? "") : ""),
      },
      regra: regraGravada
        ? {
            dias: regraGravada.dias,
            contagem: regraGravada.contagem,
            fundamento: regraGravada.fundamento,
            revisada: regraGravada.regra_revisada,
          }
        : null,
      calendario,
    },
  };
}
