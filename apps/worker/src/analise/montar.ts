import type { OpcaoPeca } from "@tesia/ia";
import {
  calcularPrazo,
  calcularPrazoInterno,
  criarCalendario,
  type Calendario,
} from "@tesia/prazos";

export type RegraBanco = {
  id: string;
  dias: number;
  contagem: "uteis" | "corridos";
  fundamento: string;
  prioridade: number;
  ativa: boolean;
};

export type OpcaoBanco = {
  codigo: string;
  nome: string;
  regra: RegraBanco | null;
};

const TJ_POR_CODIGO: Record<string, string> = {
  "01": "TJAC",
  "02": "TJAL",
  "03": "TJAP",
  "04": "TJAM",
  "05": "TJBA",
  "06": "TJCE",
  "07": "TJDFT",
  "08": "TJES",
  "09": "TJGO",
  "10": "TJMA",
  "11": "TJMT",
  "12": "TJMS",
  "13": "TJMG",
  "14": "TJPA",
  "15": "TJPB",
  "16": "TJPR",
  "17": "TJPE",
  "18": "TJPI",
  "19": "TJRJ",
  "20": "TJRN",
  "21": "TJRS",
  "22": "TJRO",
  "23": "TJRR",
  "24": "TJSC",
  "25": "TJSE",
  "26": "TJSP",
  "27": "TJTO",
};

export function siglaTribunal(numeroCnj: string | null, tribunal: string | null) {
  const cnj = numeroCnj?.match(/^\d{7}-\d{2}\.\d{4}\.(\d)\.(\d{2})\.\d{4}$/);
  if (cnj) {
    const [, justica, codigo] = cnj;
    const numero = String(Number(codigo));
    if (justica === "4") return `TRF${numero}`;
    if (justica === "5") return `TRT${numero}`;
    if (justica === "8" && codigo) return TJ_POR_CODIGO[codigo] ?? null;
  }
  const texto = tribunal?.toUpperCase().replace(/\s+/g, "") ?? "";
  return texto.match(/^(TRF\d+|TRT\d+|TJ[A-Z]{2,3})$/)?.[1] ?? null;
}

export function ritoParaRegra(rito: string) {
  return rito === "outro" ? "comum" : rito;
}

export function corrigirRito(numeroCnj: string | null, rito: string) {
  const justica = numeroCnj?.match(/^\d{7}-\d{2}\.\d{4}\.(\d)\.\d{2}\.\d{4}$/)?.[1];
  if (justica === "4" && rito === "jec") return "jef";
  if (justica === "8" && rito === "jef") return "jec";
  return rito;
}

export function opcoesParaIa(opcoes: OpcaoBanco[]): OpcaoPeca[] {
  const vistas = new Map<string, OpcaoPeca>();
  for (const { codigo, nome, regra } of ordenarPorPrioridade(opcoes)) {
    if (vistas.has(codigo)) continue;
    vistas.set(
      codigo,
      regra ? { codigo, nome, dias: regra.dias, fundamento: regra.fundamento } : { codigo, nome },
    );
  }
  return [...vistas.values()];
}

function ordenarPorPrioridade(opcoes: OpcaoBanco[]) {
  return [...opcoes].sort(
    (a, b) => (a.regra?.prioridade ?? Infinity) - (b.regra?.prioridade ?? Infinity),
  );
}

export function regraDaPeca(opcoes: OpcaoBanco[], codigo: string) {
  return (
    ordenarPorPrioridade(opcoes).find((opcao) => opcao.codigo === codigo && opcao.regra)?.regra ??
    null
  );
}

export function nomeDaPeca(opcoes: OpcaoBanco[], codigo: string) {
  return opcoes.find((opcao) => opcao.codigo === codigo)?.nome ?? codigo;
}

export type FeriadoBanco = { data: string; nome: string };
export type SuspensaoBanco = { inicio: string; fim: string; motivo: string };

export function montarCalendario(
  feriados: FeriadoBanco[],
  suspensoes: SuspensaoBanco[],
  rito: string,
): Calendario {
  return criarCalendario({ feriados, suspensoes, recessoCivil: rito !== "criminal" });
}

export type PrazoSugerido = {
  forma: "diario" | "portal";
  inicio: string;
  vencimento: string;
  interno: string;
  memoria: string[];
};

export type DadosRecebimento = {
  forma_intimacao: string;
  data_disponibilizacao: string | null;
  data_envio_portal: string | null;
};

export function marcoDoPrazo({
  forma_intimacao,
  data_disponibilizacao,
  data_envio_portal,
}: DadosRecebimento) {
  if (forma_intimacao === "citacao") return null;
  if (forma_intimacao === "portal") {
    const envio = data_envio_portal ?? data_disponibilizacao;
    return envio ? { forma: "portal" as const, data: envio } : null;
  }
  return data_disponibilizacao ? { forma: "diario" as const, data: data_disponibilizacao } : null;
}

export function calcularPrazoSugerido(
  regra: RegraBanco | null,
  recebimento: DadosRecebimento,
  calendario: Calendario,
  hoje: string,
): PrazoSugerido | null {
  const marco = marcoDoPrazo(recebimento);
  if (!regra || !marco) return null;
  const resultado = calcularPrazo(
    {
      forma: marco.forma,
      dataDisponibilizacao: marco.data,
      dias: regra.dias,
      contagem: regra.contagem,
      fundamento: regra.fundamento,
    },
    calendario,
  );
  return {
    forma: marco.forma,
    inicio: resultado.inicio,
    vencimento: resultado.vencimento,
    interno: calcularPrazoInterno({ fatal: resultado.vencimento, hoje, calendario }),
    memoria: resultado.memoria,
  };
}

export function motivoSemPrazo(regra: RegraBanco | null, recebimento: DadosRecebimento) {
  if (recebimento.forma_intimacao === "citacao")
    return "Citação: o prazo começa conforme a forma da citação (correio, oficial de justiça ou meio eletrônico). Informe a data.";
  if (!regra) return "Não há regra de prazo cadastrada para esta peça. Informe a data.";
  if (!marcoDoPrazo(recebimento)) {
    return recebimento.forma_intimacao === "portal"
      ? "A data de envio no portal não aparece no documento. Informe a data de envio ou de abertura."
      : "A data de disponibilização não aparece no documento. Informe a data.";
  }
  return null;
}

export function hojeEmBrasilia(agora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

export function textoBuscaEstilo(
  nomePeca: string,
  resumo: string | null,
  pontos: { titulo: string; explicacao?: string }[],
) {
  return [
    nomePeca,
    resumo ?? "",
    ...pontos.map((ponto) => [ponto.titulo, ponto.explicacao].filter(Boolean).join(": ")),
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 4000);
}

export function competenciaEmBrasilia(agora = new Date()) {
  return hojeEmBrasilia(agora).slice(0, 7);
}
