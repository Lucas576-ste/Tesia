import type { Analise } from "@/lib/analise";
import { isoParaData } from "@/lib/prazo-interno";

const TIPOS_DE_ATO: Record<string, string> = {
  citacao: "Citação",
  contestacao: "Contestação",
  decisao_interlocutoria: "Decisão interlocutória",
  despacho: "Despacho",
  sentenca: "Sentença",
  laudo: "Laudo pericial",
  recurso: "Recurso",
  calculos: "Cálculos",
};

export function rotuloDoAto(tipo: string) {
  return TIPOS_DE_ATO[tipo] ?? "Outro ato";
}

export function textoDoPrazo(
  { prazo, motivoSemPrazo }: Pick<Analise, "prazo" | "motivoSemPrazo">,
  confirmado: boolean,
) {
  if (!prazo) return motivoSemPrazo ?? "Não há prazo sugerido para esta intimação.";
  const situacao = confirmado ? "Prazo confirmado" : "Prazo sugerido, ainda sem confirmação";
  const umDia = prazo.dias === 1;
  const dias = umDia ? "1 dia" : `${prazo.dias} dias`;
  const singular = prazo.contagem === "corridos" ? "corrido" : "útil";
  const contagem = umDia ? singular : prazo.contagem;
  return `${situacao}: vence em ${isoParaData(prazo.vencimentoIso)} (${dias} ${contagem}).`;
}
