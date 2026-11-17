import type { JSONContent } from "@tiptap/core";
import {
  documentoDoConteudo as documentoCompartilhado,
  pendenciasDoDocumento as pendenciasCompartilhadas,
  type NoDocumento,
} from "@tesia/shared";

export { conteudoPecaSchema, documentoSchema, TAMANHO_MAXIMO_DOCUMENTO } from "@tesia/shared";

export function documentoDoConteudo(conteudo: unknown): JSONContent {
  return documentoCompartilhado(conteudo) as JSONContent;
}

export function pendenciasDoDocumento(documento: JSONContent) {
  return pendenciasCompartilhadas(documento as NoDocumento);
}
