const POR_EXTENSO: Record<string, number> = {
  "vinte e quatro": 24,
  "quarenta e oito": 48,
  "setenta e duas": 72,
  um: 1,
  dois: 2,
  três: 3,
  cinco: 5,
  oito: 8,
  dez: 10,
  quinze: 15,
  vinte: 20,
  trinta: 30,
  sessenta: 60,
  noventa: 90,
};

const NUMERO = `\\d{1,3}|${Object.keys(POR_EXTENSO).join("|")}`;

const PRAZO = new RegExp(
  `prazo(?:\\s+(?:comum|sucessivo|legal|improrrogável|máximo))?\\s+de\\s+(${NUMERO})\\s*(?:\\([^)]{1,40}\\)\\s*)?(dias?|horas?)`,
  "giu",
);

export type PrazoCitado = { quantidade: number; unidade: "dias" | "horas" };

export function prazosCitados(texto: string): PrazoCitado[] {
  const achados = [...texto.matchAll(PRAZO)].map(([, numero = "", unidade = ""]) => ({
    quantidade: POR_EXTENSO[numero.toLocaleLowerCase("pt-BR")] ?? Number(numero),
    unidade: unidade.toLocaleLowerCase("pt-BR").startsWith("d")
      ? ("dias" as const)
      : ("horas" as const),
  }));
  return [...new Map(achados.map((item) => [`${item.quantidade} ${item.unidade}`, item])).values()];
}

function descrever({ quantidade, unidade }: PrazoCitado) {
  return `${quantidade} ${quantidade === 1 ? unidade.slice(0, -1) : unidade}`;
}

export function avisoDoPrazoCitado(texto: string, diasSugeridos: number | null) {
  const citados = prazosCitados(texto);
  const confere = ({ quantidade, unidade }: PrazoCitado) =>
    unidade === "dias" && quantidade === diasSugeridos;
  if (citados.every(confere)) return null;
  const lista = new Intl.ListFormat("pt-BR").format(citados.map(descrever));
  const rotulo = citados.length === 1 ? "prazo" : "prazos";
  const sugestao =
    diasSugeridos === null
      ? ""
      : `; a sugestão usa ${descrever({ quantidade: diasSugeridos, unidade: "dias" })}`;
  return `O texto cita ${rotulo} de ${lista}${sugestao}. Confira antes de confirmar.`;
}
