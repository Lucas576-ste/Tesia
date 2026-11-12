import { calcularPrazo, calcularPrazoInterno, criarCalendario } from "@tesia/prazos";

export type FormaRecebimento = "diario" | "portal" | "citacao";

export type Recebimento = {
  forma: FormaRecebimento;
  disponibilizacao: string;
  envio: string;
  abertura: string;
};

export type RegraPrazo = {
  dias: number;
  contagem: "uteis" | "corridos";
  fundamento: string;
  revisada: boolean;
};

export type CalendarioPrazo = {
  feriados: { data: string; nome: string }[];
  suspensoes: { inicio: string; fim: string; motivo: string }[];
  recessoCivil: boolean;
};

export type PrazoRecalculado = {
  inicio: string;
  vencimento: string;
  interno: string;
  memoria: string[];
};

export const ROTULOS_FORMA: Record<FormaRecebimento, string> = {
  diario: "Diário de Justiça",
  portal: "Portal do tribunal (PJe, e-SAJ)",
  citacao: "Citação",
};

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export function recalcularPrazo(
  regra: RegraPrazo | null,
  calendarioPrazo: CalendarioPrazo,
  recebimento: Recebimento,
  hoje: string,
): PrazoRecalculado | null {
  if (!regra || recebimento.forma === "citacao") return null;
  const portal = recebimento.forma === "portal";
  const marco = portal ? recebimento.envio : recebimento.disponibilizacao;
  if (!DATA_ISO.test(marco)) return null;
  const abertura = portal && DATA_ISO.test(recebimento.abertura) ? recebimento.abertura : undefined;
  if (abertura && abertura < marco) return null;

  const calendario = criarCalendario(calendarioPrazo);
  const resultado = calcularPrazo(
    {
      forma: recebimento.forma,
      dataDisponibilizacao: marco,
      dataAbertura: abertura,
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
