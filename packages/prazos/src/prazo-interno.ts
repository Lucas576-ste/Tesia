import { ehDiaUtil, type Calendario } from "./calendario";
import { somarDias } from "./datas";

export const DIAS_PRAZO_INTERNO = 2;

export type EntradaPrazoInterno = {
  fatal: string;
  hoje: string;
  calendario: Calendario;
  diasUteis?: number;
};

export function calcularPrazoInterno({
  fatal,
  hoje,
  calendario,
  diasUteis = DIAS_PRAZO_INTERNO,
}: EntradaPrazoInterno) {
  let dia = fatal;
  for (let restantes = diasUteis; restantes > 0;) {
    dia = somarDias(dia, -1);
    if (ehDiaUtil(dia, calendario)) restantes -= 1;
  }
  if (dia >= hoje) return dia;
  return hoje <= fatal ? hoje : fatal;
}
