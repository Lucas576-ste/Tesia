import { PECA_EXEMPLO } from "@tesia/shared";
import PizZip from "pizzip";
import { ModeloInvalido, montarDocx } from "./montar";

const TWIPS_POR_MM = 56.6929;
const EMU_POR_MM = 36000;
const LIMITE_IMAGEM = 1_500_000;
const TIPOS_IMAGEM: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
};

export type PosicaoImagem = {
  origemH: "pagina" | "margem";
  origemV: "pagina" | "margem" | "paragrafo";
  xMm: number;
  yMm: number;
  alinhamentoH: "left" | "center" | "right" | null;
  atrasDoTexto: boolean;
};

export type BlocoTimbrado =
  | {
      tipo: "texto";
      texto: string;
      alinhamento: "left" | "center" | "right" | "justify";
      negrito: boolean;
      tamanhoPt: number | null;
      cor: string | null;
    }
  | {
      tipo: "imagem";
      dataUri: string;
      larguraMm: number | null;
      alturaMm: number | null;
      posicao: PosicaoImagem | null;
    };

export type InspecaoModelo = {
  pagina: {
    larguraMm: number;
    alturaMm: number;
    topoMm: number;
    direitaMm: number;
    baixoMm: number;
    esquerdaMm: number;
  };
  fonte: { nome: string; tamanhoPt: number };
  cabecalho: BlocoTimbrado[];
  rodape: BlocoTimbrado[];
};

function twipsParaMm(valor: string | undefined, padrao: number) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0
    ? Math.round((numero / TWIPS_POR_MM) * 10) / 10
    : padrao;
}

function atributo(xml: string, etiqueta: string, nome: string) {
  const achado = xml.match(new RegExp(`<${etiqueta}\\b[^>]*?\\b${nome}="([^"]*)"`));
  return achado?.[1];
}

function decodificar(texto: string) {
  return texto
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function relacoes(zip: PizZip, caminho: string) {
  const xml = zip.file(caminho)?.asText() ?? "";
  const mapa = new Map<string, string>();
  for (const [etiqueta] of xml.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = etiqueta.match(/\bId="([^"]*)"/)?.[1];
    const alvo = etiqueta.match(/\bTarget="([^"]*)"/)?.[1];
    if (id && alvo) mapa.set(id, alvo);
  }
  return mapa;
}

function caminhoWord(alvo: string) {
  const limpo = alvo.replace(/^\.?\//, "");
  return limpo.startsWith("word/") ? limpo : `word/${limpo.replace(/^\.\.\//, "")}`;
}

function imagemDoRelacionamento(zip: PizZip, alvo: string | undefined) {
  if (!alvo) return null;
  const arquivo = zip.file(caminhoWord(alvo));
  const tipo = TIPOS_IMAGEM[alvo.split(".").pop()?.toLowerCase() ?? ""];
  if (!arquivo || !tipo) return null;
  const bytes = arquivo.asUint8Array();
  if (bytes.length > LIMITE_IMAGEM) return null;
  return `data:${tipo};base64,${Buffer.from(bytes).toString("base64")}`;
}

function emMm(emu: number) {
  return Math.round((emu / EMU_POR_MM) * 10) / 10;
}

function origemHorizontal(valor: string | undefined) {
  return valor === "page" ? "pagina" : "margem";
}

function origemVertical(valor: string | undefined) {
  if (valor === "page") return "pagina";
  if (valor === "margin" || valor === "topMargin" || valor === "insideMargin") return "margem";
  return "paragrafo";
}

function posicaoDoDesenho(desenho: string): PosicaoImagem | null {
  if (!/<wp:anchor\b/.test(desenho)) return null;
  const horizontal = desenho.match(/<wp:positionH\b([^>]*)>([\s\S]*?)<\/wp:positionH>/);
  const vertical = desenho.match(/<wp:positionV\b([^>]*)>([\s\S]*?)<\/wp:positionV>/);
  if (!horizontal || !vertical) return null;
  const deslocamento = (miolo: string | undefined) => {
    const emu = Number(miolo?.match(/<wp:posOffset>\s*(-?\d+)\s*</)?.[1]);
    return Number.isFinite(emu) ? emMm(emu) : 0;
  };
  const alinhamento = horizontal[2]?.match(/<wp:align>\s*(left|center|right)\s*</)?.[1];
  return {
    origemH: origemHorizontal(horizontal[1]?.match(/relativeFrom="([^"]*)"/)?.[1]),
    origemV: origemVertical(vertical[1]?.match(/relativeFrom="([^"]*)"/)?.[1]),
    xMm: deslocamento(horizontal[2]),
    yMm: deslocamento(vertical[2]),
    alinhamentoH: (alinhamento as "left" | "center" | "right" | undefined) ?? null,
    atrasDoTexto: /<wp:anchor\b[^>]*\bbehindDoc="(1|true)"/.test(desenho),
  };
}

function blocosDaParte(zip: PizZip, caminho: string): BlocoTimbrado[] {
  const xml = zip.file(caminho)?.asText();
  if (!xml) return [];
  const nomeRel = caminho.replace(/^word\//, "word/_rels/") + ".rels";
  const rels = relacoes(zip, nomeRel);
  const blocos: BlocoTimbrado[] = [];
  for (const [paragrafo] of xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)) {
    const texto = decodificar(
      [...paragrafo.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => m[1] ?? "").join(""),
    ).trim();
    const alinhamentoBruto = atributo(paragrafo, "w:jc", "w:val");
    const alinhamento =
      alinhamentoBruto === "center" || alinhamentoBruto === "right"
        ? alinhamentoBruto
        : alinhamentoBruto === "both"
          ? "justify"
          : "left";
    for (const [desenho] of paragrafo.matchAll(/<w:drawing\b[\s\S]*?<\/w:drawing>/g)) {
      const dataUri = imagemDoRelacionamento(
        zip,
        rels.get(desenho.match(/<a:blip\b[^>]*?\br:embed="([^"]*)"/)?.[1] ?? ""),
      );
      if (!dataUri) continue;
      const largura = Number(atributo(desenho, "wp:extent", "cx"));
      const altura = Number(atributo(desenho, "wp:extent", "cy"));
      blocos.push({
        tipo: "imagem",
        dataUri,
        larguraMm: largura > 0 ? emMm(largura) : null,
        alturaMm: altura > 0 ? emMm(altura) : null,
        posicao: posicaoDoDesenho(desenho),
      });
    }
    for (const [, id] of paragrafo.matchAll(/<v:imagedata\b[^>]*?\br:id="([^"]*)"/g)) {
      const dataUri = imagemDoRelacionamento(zip, rels.get(id ?? ""));
      if (dataUri)
        blocos.push({ tipo: "imagem", dataUri, larguraMm: null, alturaMm: null, posicao: null });
    }
    if (texto) {
      const tamanho = Number(atributo(paragrafo, "w:sz", "w:val"));
      const cor = atributo(paragrafo, "w:color", "w:val");
      blocos.push({
        tipo: "texto",
        texto,
        alinhamento,
        negrito: /<w:b\s*\/>|<w:b\s+w:val="(1|true)"/.test(paragrafo),
        tamanhoPt: tamanho > 0 ? tamanho / 2 : null,
        cor: cor && /^[0-9a-f]{6}$/i.test(cor) ? `#${cor}` : null,
      });
    }
  }
  return blocos;
}

function parteDaSecao(secao: string, etiqueta: "headerReference" | "footerReference") {
  const referencias = [...secao.matchAll(new RegExp(`<w:${etiqueta}\\b[^>]*>`, "g"))].map(
    (m) => m[0],
  );
  const escolhida =
    referencias.find((r) => /w:type="default"/.test(r)) ?? referencias[0] ?? undefined;
  return escolhida?.match(/\br:id="([^"]*)"/)?.[1];
}

function fonteDoModelo(zip: PizZip) {
  const estilos = zip.file("word/styles.xml")?.asText() ?? "";
  const padrao = estilos.match(/<w:docDefaults>[\s\S]*?<\/w:docDefaults>/)?.[0] ?? "";
  const normal = estilos.match(/<w:style\b[^>]*w:styleId="Normal"[\s\S]*?<\/w:style>/)?.[0] ?? "";
  const nome =
    atributo(normal, "w:rFonts", "w:ascii") ??
    atributo(padrao, "w:rFonts", "w:ascii") ??
    "Times New Roman";
  const tamanho = Number(atributo(normal, "w:sz", "w:val") ?? atributo(padrao, "w:sz", "w:val"));
  return { nome, tamanhoPt: tamanho > 0 ? tamanho / 2 : 12 };
}

export function inspecionarModelo(bytes: Uint8Array): InspecaoModelo {
  let zip: PizZip;
  let documento: string;
  try {
    zip = new PizZip(bytes);
    documento = zip.file("word/document.xml")?.asText() ?? "";
  } catch {
    throw new ModeloInvalido("O arquivo não é um .docx válido. Envie um arquivo salvo pelo Word.");
  }
  if (!/<w:body[\s>]/.test(documento)) {
    throw new ModeloInvalido("O arquivo não é um .docx válido. Envie um arquivo salvo pelo Word.");
  }

  const secoes = documento.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/g);
  const secao = secoes?.at(-1) ?? "";
  const rels = relacoes(zip, "word/_rels/document.xml.rels");
  const alvoCabecalho = rels.get(parteDaSecao(secao, "headerReference") ?? "");
  const alvoRodape = rels.get(parteDaSecao(secao, "footerReference") ?? "");
  const cabecalho = alvoCabecalho ? blocosDaParte(zip, caminhoWord(alvoCabecalho)) : [];
  const rodape = alvoRodape ? blocosDaParte(zip, caminhoWord(alvoRodape)) : [];

  if (!cabecalho.length) {
    throw new ModeloInvalido(
      "Não encontramos cabeçalho neste arquivo. Envie um .docx com o cabeçalho configurado.",
    );
  }

  return {
    pagina: {
      larguraMm: twipsParaMm(atributo(secao, "w:pgSz", "w:w"), 210),
      alturaMm: twipsParaMm(atributo(secao, "w:pgSz", "w:h"), 297),
      topoMm: twipsParaMm(atributo(secao, "w:pgMar", "w:top"), 30),
      direitaMm: twipsParaMm(atributo(secao, "w:pgMar", "w:right"), 25),
      baixoMm: twipsParaMm(atributo(secao, "w:pgMar", "w:bottom"), 25),
      esquerdaMm: twipsParaMm(atributo(secao, "w:pgMar", "w:left"), 30),
    },
    fonte: fonteDoModelo(zip),
    cabecalho,
    rodape,
  };
}

export function montarPecaTeste(modelo: Uint8Array | null) {
  return montarDocx(modelo, PECA_EXEMPLO);
}
