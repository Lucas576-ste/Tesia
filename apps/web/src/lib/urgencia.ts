import {
  contarUrgencias,
  pesoUrgencia,
  textoUrgencia,
  urgencia,
  type EntradaUrgencia,
  type NivelUrgencia,
} from "@tesia/shared";
import { hojeBrasilia } from "@/lib/hoje";
import type { LinhaPrazo } from "@/lib/prazo";

export type { NivelUrgencia };

function entrada(prazo: LinhaPrazo): EntradaUrgencia {
  const hoje = hojeBrasilia().split("-").reverse().join("/");
  return {
    concluido: prazo.status === "protocolado",
    diasUteis: prazo.diasUteis,
    diasAtraso: prazo.diasAtraso ?? 0,
    venceHoje: prazo.vencimento === hoje,
  };
}

export function nivelDoPrazo(prazo: LinhaPrazo) {
  return urgencia(entrada(prazo));
}

export function textoDoPrazo(prazo: LinhaPrazo) {
  if (prazo.status === "protocolado") return prazo.tipo ? "Cumprido" : "Protocolado";
  return textoUrgencia(entrada(prazo));
}

export function contagemDosPrazos(prazos: LinhaPrazo[]) {
  const contagem = contarUrgencias(prazos.map(entrada));
  return {
    ...contagem,
    ate3ComHoje: contagem.hoje + contagem.ate3,
    rascunhos: prazos.filter(({ status }) => status === "rascunho_pronto").length,
  };
}

export function ordenarPorUrgencia(prazos: LinhaPrazo[]) {
  return [...prazos].sort((a, b) => {
    const diferenca = pesoUrgencia(nivelDoPrazo(a)) - pesoUrgencia(nivelDoPrazo(b));
    if (diferenca !== 0) return diferenca;
    return (b.diasAtraso ?? 0) - (a.diasAtraso ?? 0) || a.diasUteis - b.diasUteis;
  });
}

export const TOM_URGENCIA: Record<NivelUrgencia, string> = {
  vencido: "bg-erro text-white",
  hoje: "bg-erro-fundo text-erro",
  ate3: "bg-atencao-fundo text-atencao",
  mais3: "bg-muted text-texto-secundario",
  concluido: "bg-sucesso-fundo text-sucesso",
};
