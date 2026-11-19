const LIGACOES = new Set(["de", "da", "do", "das", "dos", "e"]);
const SIGLAS = /^(ltda\.?|s\/a|s\.a\.?|me|epp|eireli|inss|cpf|cnpj|oab|tj[a-z]{2}|trf\d|trt\d+)$/i;

function palavraEmTitulo(palavra: string, indice: number) {
  if (SIGLAS.test(palavra)) return palavra.toLocaleUpperCase("pt-BR");
  const minuscula = palavra.toLocaleLowerCase("pt-BR");
  if (indice > 0 && LIGACOES.has(minuscula)) return minuscula;
  return minuscula
    .split("-")
    .map((parte) => parte.charAt(0).toLocaleUpperCase("pt-BR") + parte.slice(1))
    .join("-");
}

export function tituloNome(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .map((palavra, indice) => palavraEmTitulo(palavra, indice))
    .join(" ");
}

export function iniciais(nome: string) {
  const palavras = nome
    .trim()
    .split(/\s+/)
    .filter(
      (palavra) => !LIGACOES.has(palavra.toLocaleLowerCase("pt-BR")) && !SIGLAS.test(palavra),
    );
  const primeira = palavras[0]?.charAt(0) ?? "";
  const ultima = palavras.length > 1 ? (palavras.at(-1)?.charAt(0) ?? "") : "";
  return (primeira + ultima).toLocaleUpperCase("pt-BR") || "?";
}
