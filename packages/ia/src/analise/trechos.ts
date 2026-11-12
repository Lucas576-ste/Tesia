function normalizar(texto: string) {
  return texto
    .normalize("NFC")
    .toLocaleLowerCase("pt-BR")
    .replace(/[“”"«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function trechoNoDocumento(trecho: string, documento: string) {
  const alvo = normalizar(trecho);
  return alvo.length >= 10 && normalizar(documento).includes(alvo);
}

export function manterComTrecho<T extends { trecho: string }>(itens: T[], documento: string) {
  return itens.filter((item) => trechoNoDocumento(item.trecho, documento));
}
