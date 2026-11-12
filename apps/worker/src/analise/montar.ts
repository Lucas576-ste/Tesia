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
  inicio: string;
  vencimento: string;
  interno: string;
  memoria: string[];
};

export function calcularPrazoSugerido(
  regra: RegraBanco | null,
  dataDisponibilizacao: string | null,
  calendario: Calendario,
  hoje: string,
): PrazoSugerido | null {
  if (!regra || !dataDisponibilizacao) return null;
  const resultado = calcularPrazo(
    {
      dataDisponibilizacao,
      dias: regra.dias,
      contagem: regra.contagem,
      fundamento: regra.fundamento,
    },
    calendario,
  );
  return {
    inicio: resultado.inicio,
    vencimento: resultado.vencimento,
    interno: calcularPrazoInterno({ fatal: resultado.vencimento, hoje, calendario }),
    memoria: resultado.memoria,
  };
}

export function motivoSemPrazo(regra: RegraBanco | null, dataDisponibilizacao: string | null) {
  if (!regra) return "Não há regra de prazo cadastrada para esta peça. Informe a data.";
  if (!dataDisponibilizacao)
    return "A data de disponibilização não aparece no documento. Informe a data.";
  return null;
}

export function hojeEmBrasilia(agora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}
