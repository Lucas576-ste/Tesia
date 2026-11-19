const LIGACOES = new Set(["de", "da", "do", "das", "dos", "e"]);
const SUFIXOS = /\b(s\.?\s?a\.?|ltda\.?|me|epp|eireli)\b\.?/gi;

function capitalizar(palavra: string) {
  const minuscula = palavra.toLocaleLowerCase("pt-BR");
  return LIGACOES.has(minuscula)
    ? minuscula
    : minuscula.charAt(0).toLocaleUpperCase("pt-BR") + minuscula.slice(1);
}

function curtoDeUmLado(lado: string) {
  const sigla = lado.match(/(?:—|–|-|\()\s*([A-Z]{2,8})\s*\)?\s*$/);
  if (sigla?.[1]) return sigla[1];
  const palavras = lado
    .replace(SUFIXOS, "")
    .split(/[\s,]+/)
    .filter(Boolean);
  const principais = palavras.filter((palavra) => !LIGACOES.has(palavra.toLowerCase()));
  if (principais.length === 1 && /^[A-ZÀ-Ý]{2,5}$/.test(principais[0] ?? ""))
    return principais[0] ?? lado;
  const escolhidas: string[] = [];
  let contadas = 0;
  for (const palavra of palavras) {
    const ligacao = LIGACOES.has(palavra.toLowerCase());
    if (!ligacao) contadas += 1;
    if (contadas > 2) break;
    escolhidas.push(palavra);
  }
  while (escolhidas.length && LIGACOES.has((escolhidas.at(-1) ?? "").toLowerCase()))
    escolhidas.pop();
  return escolhidas.map(capitalizar).join(" ") || lado;
}

export function nomeCurto(partes: string) {
  const lados = partes.split(/\s+x\s+/i);
  if (lados.length < 2) return curtoDeUmLado(partes);
  return lados.map((lado) => curtoDeUmLado(lado.split(",")[0] ?? lado)).join(" x ");
}
