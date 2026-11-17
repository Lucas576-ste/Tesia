import type { JSONContent } from "@tiptap/core";
import { z } from "zod";

export const documentoSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.unknown()).optional(),
});

export const TAMANHO_MAXIMO_DOCUMENTO = 500_000;

const PENDENCIA = /\[CONFIRMAR:?\s*([^\]]*)\]/g;

export function secoesParaDocumento(secoes: { titulo: string; texto: string }[]): JSONContent {
  const content: JSONContent[] = [];
  for (const { titulo, texto } of secoes) {
    if (titulo.trim()) {
      content.push({
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: titulo.trim() }],
      });
    }
    for (const paragrafo of texto.split(/\n{2,}/)) {
      const limpo = paragrafo.replace(/\s*\n\s*/g, " ").trim();
      if (limpo) content.push({ type: "paragraph", content: [{ type: "text", text: limpo }] });
    }
  }
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

function textos(no: JSONContent, saida: string[] = []) {
  if (no.text) saida.push(no.text);
  for (const filho of no.content ?? []) textos(filho, saida);
  return saida;
}

export function pendenciasDoDocumento(documento: JSONContent) {
  const linhas = (documento.content ?? []).map((bloco) => textos(bloco).join(""));
  return linhas.flatMap((linha) =>
    [...linha.matchAll(PENDENCIA)].map(([, texto]) => ({ texto: (texto ?? "").trim() })),
  );
}

export const conteudoPecaSchema = z.object({
  doc: documentoSchema.optional(),
  secoes: z.array(z.object({ titulo: z.string(), texto: z.string() })).optional(),
  aviso: z.string().nullable().optional(),
});

export function documentoDoConteudo(conteudo: unknown): JSONContent {
  const lido = conteudoPecaSchema.safeParse(conteudo).data;
  if (lido?.doc) return lido.doc as JSONContent;
  return secoesParaDocumento(lido?.secoes ?? []);
}
