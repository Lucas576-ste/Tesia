import { textoDoNo, type NoDocumento } from "@tesia/shared";

const PENDENCIA = /(\[CONFIRMAR[^\]]*\])/g;

export function semControle(texto: string) {
  return [...texto]
    .filter((caractere) => {
      const codigo = caractere.charCodeAt(0);
      return codigo >= 32 || codigo === 9 || codigo === 10 || codigo === 13;
    })
    .join("");
}

export function escaparXml(texto: string) {
  return semControle(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Marcas = { negrito: boolean; italico: boolean; sublinhado: boolean };

function marcasDoNo(no: NoDocumento): Marcas {
  const tipos = (no.marks ?? []).map((marca) =>
    typeof marca === "object" && marca && "type" in marca ? String(marca.type) : "",
  );
  return {
    negrito: tipos.includes("bold"),
    italico: tipos.includes("italic"),
    sublinhado: tipos.includes("underline"),
  };
}

function run(texto: string, marcas: Marcas, destaque: boolean) {
  const propriedades = [
    marcas.negrito ? "<w:b/>" : "",
    marcas.italico ? "<w:i/>" : "",
    marcas.sublinhado ? '<w:u w:val="single"/>' : "",
    destaque ? '<w:highlight w:val="yellow"/>' : "",
  ].join("");
  const rPr = propriedades ? `<w:rPr>${propriedades}</w:rPr>` : "";
  return `<w:r>${rPr}<w:t xml:space="preserve">${escaparXml(texto)}</w:t></w:r>`;
}

export function runsDoNo(no: NoDocumento, forcarNegrito = false): string {
  if (no.type === "hardBreak") return "<w:r><w:br/></w:r>";
  if (no.type === "text" && no.text) {
    const marcas = marcasDoNo(no);
    if (forcarNegrito) marcas.negrito = true;
    return no.text
      .split(PENDENCIA)
      .filter(Boolean)
      .map((parte) => run(parte, marcas, parte.startsWith("[CONFIRMAR")))
      .join("");
  }
  return (no.content ?? []).map((filho) => runsDoNo(filho, forcarNegrito)).join("");
}

const RECUO_PRIMEIRA_LINHA = 1134;
const MAXIMO_CAIXA_ALTA = 300;

export function ehCaixaAlta(texto: string) {
  const letras = texto.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letras.length < 8 || texto.length > MAXIMO_CAIXA_ALTA) return false;
  return letras.replace(/[^A-ZÀ-Þ]/g, "").length / letras.length > 0.85;
}

function paragrafo(runs: string, tipo: "titulo" | "corpo" | "lista") {
  const pPr =
    tipo === "titulo"
      ? '<w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/><w:jc w:val="left"/></w:pPr>'
      : tipo === "lista"
        ? '<w:pPr><w:ind w:left="720"/><w:jc w:val="both"/></w:pPr>'
        : `<w:pPr><w:ind w:firstLine="${RECUO_PRIMEIRA_LINHA}"/><w:jc w:val="both"/></w:pPr>`;
  return `<w:p>${pPr}${runs}</w:p>`;
}

export function paragrafosDoDocumento(documento: NoDocumento): string {
  const saida: string[] = [];
  for (const bloco of documento.content ?? []) {
    if (bloco.type === "heading") {
      saida.push(paragrafo(runsDoNo(bloco, true), "titulo"));
    } else if (bloco.type === "bulletList" || bloco.type === "orderedList") {
      (bloco.content ?? []).forEach((item, indice) => {
        const prefixo = bloco.type === "orderedList" ? `${indice + 1}. ` : "• ";
        saida.push(
          paragrafo(
            run(prefixo, { negrito: false, italico: false, sublinhado: false }, false) +
              runsDoNo(item),
            "lista",
          ),
        );
      });
    } else if (bloco.type === "paragraph" && ehCaixaAlta(textoDoNo(bloco))) {
      saida.push(paragrafo(runsDoNo(bloco, true), "titulo"));
    } else if (bloco.type === "paragraph") {
      saida.push(paragrafo(runsDoNo(bloco), "corpo"));
    } else if (bloco.content?.length) {
      saida.push(paragrafo(runsDoNo(bloco), "corpo"));
    }
  }
  return saida.length ? saida.join("") : "<w:p/>";
}
