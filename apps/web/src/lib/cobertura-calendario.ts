export type Cobertura = { tribunal: string | null; anos: number[] };

type RegistroCalendario = { tribunal: string | null; escritorio_id: string | null };
type FeriadoRegistrado = RegistroCalendario & { data: string; abrangencia: string };
type SuspensaoRegistrada = RegistroCalendario & { inicio: string; fim: string };

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

const anoDe = (data: string) => Number(data.slice(0, 4));

function anosEntre(primeiro: number, ultimo: number) {
  return Array.from({ length: ultimo - primeiro + 1 }, (_, indice) => primeiro + indice);
}

export function montarCobertura(
  tribunal: string | null,
  feriados: FeriadoRegistrado[],
  suspensoes: SuspensaoRegistrada[],
): Cobertura {
  if (!tribunal) return { tribunal: null, anos: [] };
  const oficial = (registro: RegistroCalendario) =>
    registro.escritorio_id === null && registro.tribunal === tribunal;
  const anos = [
    ...feriados
      .filter((feriado) => feriado.abrangencia === "tribunal" && oficial(feriado))
      .map(({ data }) => anoDe(data)),
    ...suspensoes
      .filter(oficial)
      .flatMap(({ inicio, fim }) => anosEntre(anoDe(inicio), anoDe(fim))),
  ];
  return { tribunal, anos: [...new Set(anos)].sort((a, b) => a - b) };
}

function cobre({ tribunal, anos }: Cobertura, datas: string[]) {
  if (!tribunal || anos.length === 0) return false;
  if (datas.length === 0) return true;
  const informados = datas.map(anoDe);
  return anosEntre(Math.min(...informados), Math.max(...informados)).every((ano) =>
    anos.includes(ano),
  );
}

export function avisoDeCalendario(cobertura: Cobertura, datas: (string | null | undefined)[]) {
  const validas = datas.filter((data): data is string => Boolean(data && DATA_ISO.test(data)));
  if (cobre(cobertura, validas)) return null;
  const abertura = cobertura.tribunal
    ? `Não há calendário oficial do ${cobertura.tribunal} cadastrado para este período.`
    : "O tribunal deste processo não foi identificado, então não há calendário oficial para este período.";
  return `${abertura} A conta não inclui os feriados e suspensões do tribunal, salvo os que você cadastrou. Confira antes de confirmar.`;
}
