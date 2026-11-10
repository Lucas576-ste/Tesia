import { z } from "zod";
import { fimDeSemana, somarDias } from "./datas";
import { feriadosNacionais } from "./feriados";

const entradaCalendarioSchema = z.object({
  feriados: z.array(z.object({ data: z.iso.date(), nome: z.string().min(1) })).default([]),
  suspensoes: z
    .array(z.object({ inicio: z.iso.date(), fim: z.iso.date(), motivo: z.string().min(1) }))
    .default([]),
  recessoCivil: z.boolean().default(true),
});

export type EntradaCalendario = z.input<typeof entradaCalendarioSchema>;

export type Calendario = {
  motivoNaoUtil: (data: string) => string | null;
};

export const MOTIVO_RECESSO = "recesso forense (CPC, art. 220)";

function noRecesso(data: string) {
  const mesDia = data.slice(5);
  return mesDia >= "12-20" || mesDia <= "01-20";
}

export function criarCalendario(entrada: EntradaCalendario = {}): Calendario {
  const { feriados, suspensoes, recessoCivil } = entradaCalendarioSchema.parse(entrada);
  const extras = new Map(feriados.map((feriado) => [feriado.data, feriado.nome]));
  const porAno = new Map<number, Map<string, string>>();

  function nacionais(ano: number) {
    let mapa = porAno.get(ano);
    if (!mapa) {
      mapa = new Map(feriadosNacionais(ano).map((feriado) => [feriado.data, feriado.nome]));
      porAno.set(ano, mapa);
    }
    return mapa;
  }

  return {
    motivoNaoUtil(data) {
      if (fimDeSemana(data)) return "fim de semana";
      const feriado = nacionais(Number(data.slice(0, 4))).get(data) ?? extras.get(data);
      if (feriado) return feriado;
      if (recessoCivil && noRecesso(data)) return MOTIVO_RECESSO;
      const suspensao = suspensoes.find((item) => item.inicio <= data && data <= item.fim);
      return suspensao ? suspensao.motivo : null;
    },
  };
}

export function ehDiaUtil(data: string, calendario: Calendario) {
  return calendario.motivoNaoUtil(data) === null;
}

export function proximoDiaUtil(data: string, calendario: Calendario) {
  let dia = somarDias(data, 1);
  while (!ehDiaUtil(dia, calendario)) dia = somarDias(dia, 1);
  return dia;
}
