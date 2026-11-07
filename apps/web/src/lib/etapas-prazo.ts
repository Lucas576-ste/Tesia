export const ROTULOS_ETAPA = {
  elaborar: "Elaborar",
  revisar: "Revisar",
  protocolar: "Protocolar",
} as const;

export type EtapaPrazo = keyof typeof ROTULOS_ETAPA;

export type EtapasPrazo = {
  atual: EtapaPrazo;
  responsaveis: Record<EtapaPrazo, string | null>;
};

export function etapasPadrao(responsavel: string): EtapasPrazo {
  return {
    atual: "elaborar",
    responsaveis: { elaborar: responsavel, revisar: null, protocolar: responsavel },
  };
}

export function proximaEtapa({ atual, responsaveis }: EtapasPrazo): EtapaPrazo | null {
  if (atual === "protocolar") return null;
  return atual === "elaborar" && responsaveis.revisar ? "revisar" : "protocolar";
}

export function assumirEtapas(etapas: EtapasPrazo, responsavel: string): EtapasPrazo {
  return {
    ...etapas,
    responsaveis: { ...etapas.responsaveis, elaborar: responsavel, protocolar: responsavel },
  };
}
