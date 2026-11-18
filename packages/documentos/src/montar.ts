import type { NoDocumento } from "@tesia/shared";
import PizZip from "pizzip";
import { ARQUIVOS_MODELO_PADRAO, documentoXmlPadrao, SECAO_PADRAO } from "./modelo-padrao";
import { paragrafosDoDocumento, semControle } from "./xml";

export class ModeloInvalido extends Error {}

const CAMINHO_DOCUMENTO = "word/document.xml";

function abrir(bytes: Uint8Array) {
  try {
    const zip = new PizZip(bytes);
    const documento = zip.file(CAMINHO_DOCUMENTO)?.asText();
    if (!documento || !/<w:body[\s>]/.test(documento))
      throw new ModeloInvalido("O arquivo não tem o corpo de um .docx");
    return { zip, documento };
  } catch (erro) {
    if (erro instanceof ModeloInvalido) throw erro;
    throw new ModeloInvalido("O arquivo não é um .docx válido");
  }
}

export function validarModelo(bytes: Uint8Array) {
  abrir(bytes);
  return true;
}

function secaoDoModelo(corpo: string) {
  const secoes = corpo.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>|<w:sectPr\b[^>]*\/>/g);
  return secoes?.at(-1) ?? SECAO_PADRAO;
}

export function trocarCorpo(documentoXml: string, paragrafos: string) {
  const inicio = documentoXml.search(/<w:body[\s>]/);
  const abertura = documentoXml.indexOf(">", inicio) + 1;
  const fim = documentoXml.lastIndexOf("</w:body>");
  if (inicio < 0 || fim < 0) throw new ModeloInvalido("O arquivo não tem o corpo de um .docx");
  const corpo = documentoXml.slice(abertura, fim);
  return (
    documentoXml.slice(0, abertura) + paragrafos + secaoDoModelo(corpo) + documentoXml.slice(fim)
  );
}

export function montarDocx(modelo: Uint8Array | null, documento: NoDocumento): Uint8Array {
  const paragrafos = paragrafosDoDocumento(documento);
  if (!modelo) {
    const zip = new PizZip();
    for (const [caminho, conteudo] of Object.entries(ARQUIVOS_MODELO_PADRAO))
      zip.file(caminho, conteudo);
    zip.file(CAMINHO_DOCUMENTO, documentoXmlPadrao(paragrafos));
    return zip.generate({ type: "uint8array", compression: "DEFLATE" });
  }
  const { zip, documento: documentoXml } = abrir(modelo);
  zip.file(CAMINHO_DOCUMENTO, trocarCorpo(documentoXml, paragrafos));
  return zip.generate({ type: "uint8array", compression: "DEFLATE" });
}

export function nomeArquivoDocx(partes: string[]) {
  const nome = semControle(partes.filter(Boolean).join(" - "))
    .normalize("NFC")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return `${nome || "peca"}.docx`;
}
