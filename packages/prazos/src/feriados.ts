import { dataIso, somarDias } from "./datas";

export type TipoFeriado = "nacional" | "forense";

export type Feriado = {
  data: string;
  nome: string;
  tipo: TipoFeriado;
};

const FIXOS: [number, number, string][] = [
  [1, 1, "Confraternização Universal"],
  [4, 21, "Tiradentes"],
  [5, 1, "Dia do Trabalho"],
  [9, 7, "Independência do Brasil"],
  [10, 12, "Nossa Senhora Aparecida"],
  [11, 2, "Finados"],
  [11, 15, "Proclamação da República"],
  [11, 20, "Dia Nacional de Zumbi e da Consciência Negra"],
  [12, 25, "Natal"],
];

export function pascoa(ano: number) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return dataIso(ano, mes, dia);
}

export function feriadosNacionais(ano: number): Feriado[] {
  const domingoPascoa = pascoa(ano);
  const fixos = FIXOS.map(([mes, dia, nome]) => ({
    data: dataIso(ano, mes, dia),
    nome,
    tipo: "nacional" as const,
  }));
  const moveis: Feriado[] = [
    { data: somarDias(domingoPascoa, -48), nome: "Carnaval", tipo: "forense" },
    { data: somarDias(domingoPascoa, -47), nome: "Carnaval", tipo: "forense" },
    { data: somarDias(domingoPascoa, -2), nome: "Sexta-feira Santa", tipo: "nacional" },
    { data: somarDias(domingoPascoa, 60), nome: "Corpus Christi", tipo: "forense" },
  ];
  return [...fixos, ...moveis].sort((x, y) => x.data.localeCompare(y.data));
}
