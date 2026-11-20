const TITULO_DE_PRAZO = new RegExp(
  [
    "^\\s*prazo\\b(?!\\s+(prescricional|decadencial))",
    "tempestiv",
    "revelia",
    "juntada d[oa] (comprovante|mandado|aviso|carta)",
    "(in[íi]cio|contagem|termo inicial) d[oa] prazo",
  ].join("|"),
  "i",
);

export function pontosSemPrazo<T extends { titulo: string }>(pontos: T[]) {
  return pontos.filter(({ titulo }) => !TITULO_DE_PRAZO.test(titulo));
}
