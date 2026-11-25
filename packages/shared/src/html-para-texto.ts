const ENTIDADES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ordm: "º",
  ordf: "ª",
  sect: "§",
  ndash: "–",
  mdash: "—",
  aacute: "á",
  Aacute: "Á",
  eacute: "é",
  Eacute: "É",
  iacute: "í",
  Iacute: "Í",
  oacute: "ó",
  Oacute: "Ó",
  uacute: "ú",
  Uacute: "Ú",
  agrave: "à",
  Agrave: "À",
  acirc: "â",
  Acirc: "Â",
  ecirc: "ê",
  Ecirc: "Ê",
  ocirc: "ô",
  Ocirc: "Ô",
  atilde: "ã",
  Atilde: "Ã",
  otilde: "õ",
  Otilde: "Õ",
  ccedil: "ç",
  Ccedil: "Ç",
  uuml: "ü",
};

function decodificar(texto: string) {
  return texto.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (inteira, nome: string) => {
    if (nome.startsWith("#")) {
      const codigo =
        nome[1]?.toLowerCase() === "x" ? parseInt(nome.slice(2), 16) : Number(nome.slice(1));
      return Number.isInteger(codigo) && codigo > 0 && codigo <= 0x10ffff
        ? String.fromCodePoint(codigo)
        : inteira;
    }
    return ENTIDADES[nome] ?? ENTIDADES[nome.toLowerCase()] ?? inteira;
  });
}

export function htmlParaTexto(texto: string) {
  if (!/<\/?[a-z!][^>]*>/i.test(texto)) return texto;
  const semMarcas = texto
    .replace(/<(style|script|head)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h[1-6]|table|ul|ol)\s*>/gi, "\n")
    .replace(/<\/(td|th)\s*>/gi, " ")
    .replace(/<[^>]*>/g, "");
  return decodificar(semMarcas)
    .split("\n")
    .map((linha) => linha.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}
