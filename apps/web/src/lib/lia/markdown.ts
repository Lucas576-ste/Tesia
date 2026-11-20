export type Trecho =
  | { tipo: "texto"; valor: string }
  | { tipo: "negrito"; valor: string }
  | { tipo: "link"; texto: string; href: string };

export type Bloco =
  | { tipo: "paragrafo"; trechos: Trecho[] }
  | { tipo: "lista"; ordenada: boolean; itens: Trecho[][] };

const LINK_INTERNO =
  /^\/app(?:\/[A-Za-z0-9\-_./]*)?(?:\?[A-Za-z0-9\-_=&%.]*)?(?:#[A-Za-z0-9\-_]*)?$/;
const INLINE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function linkInterno(href: string) {
  return LINK_INTERNO.test(href);
}

function trechos(linha: string): Trecho[] {
  const saida: Trecho[] = [];
  let ultimo = 0;
  for (const achado of linha.matchAll(INLINE)) {
    const inicio = achado.index ?? 0;
    if (inicio > ultimo) saida.push({ tipo: "texto", valor: linha.slice(ultimo, inicio) });
    const [inteiro, negrito, texto, href] = achado;
    if (negrito) saida.push({ tipo: "negrito", valor: negrito });
    else if (texto && href && linkInterno(href)) saida.push({ tipo: "link", texto, href });
    else saida.push({ tipo: "texto", valor: texto ?? inteiro });
    ultimo = inicio + inteiro.length;
  }
  if (ultimo < linha.length) saida.push({ tipo: "texto", valor: linha.slice(ultimo) });
  return saida;
}

export function parsearMarkdown(texto: string): Bloco[] {
  const blocos: Bloco[] = [];
  let paragrafo: string[] = [];
  const fecharParagrafo = () => {
    if (paragrafo.length) blocos.push({ tipo: "paragrafo", trechos: trechos(paragrafo.join(" ")) });
    paragrafo = [];
  };
  for (const linha of texto.split("\n")) {
    const item = linha.match(/^\s*(?:([-*•])|(\d+)[.)])\s+(.*)$/);
    if (item) {
      fecharParagrafo();
      const ordenada = Boolean(item[2]);
      const ultimo = blocos.at(-1);
      if (ultimo?.tipo === "lista" && ultimo.ordenada === ordenada) {
        ultimo.itens.push(trechos(item[3] ?? ""));
      } else {
        blocos.push({ tipo: "lista", ordenada, itens: [trechos(item[3] ?? "")] });
      }
    } else if (linha.trim() === "") {
      fecharParagrafo();
    } else {
      paragrafo.push(linha.trim());
    }
  }
  fecharParagrafo();
  return blocos;
}
