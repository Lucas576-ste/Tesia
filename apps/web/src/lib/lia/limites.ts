import type { IdPlano } from "@/lib/plano";

export const PERGUNTAS_LIA_POR_DIA: Record<IdPlano, number> = {
  start: 15,
  pro: 30,
  fundador: 30,
  sociedade: 50,
};

export const AVISO_RESTANTES = 3;
export const MAXIMO_CARACTERES = 2000;

export function limiteLia(plano: IdPlano) {
  const configurado = Number(process.env.LIA_LIMITE_DIARIO);
  return Number.isInteger(configurado) && configurado >= 0 && process.env.LIA_LIMITE_DIARIO
    ? configurado
    : PERGUNTAS_LIA_POR_DIA[plano];
}
