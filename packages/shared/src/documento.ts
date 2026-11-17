import { z } from "zod";

export type NoDocumento = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: NoDocumento[];
  marks?: unknown[];
};

export type SecaoDocumento = { titulo: string; texto: string };

export const documentoSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.unknown()).optional(),
});

export const TAMANHO_MAXIMO_DOCUMENTO = 500_000;

const PENDENCIA = /\[CONFIRMAR:?\s*([^\]]*)\]/g;

export function secoesParaDocumento(secoes: SecaoDocumento[]): NoDocumento {
  const content: NoDocumento[] = [];
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

export function textoDoNo(no: NoDocumento): string {
  if (no.text) return no.text;
  return (no.content ?? []).map(textoDoNo).join("");
}

export function documentoParaSecoes(documento: NoDocumento): SecaoDocumento[] {
  const secoes: SecaoDocumento[] = [];
  let atual: { titulo: string; paragrafos: string[] } = { titulo: "", paragrafos: [] };
  const fechar = () => {
    if (atual.titulo || atual.paragrafos.length) {
      secoes.push({ titulo: atual.titulo, texto: atual.paragrafos.join("\n\n") });
    }
  };
  for (const bloco of documento.content ?? []) {
    const texto = textoDoNo(bloco).trim();
    if (bloco.type === "heading") {
      fechar();
      atual = { titulo: texto, paragrafos: [] };
    } else if (texto) {
      atual.paragrafos.push(texto);
    }
  }
  fechar();
  return secoes;
}

export function pendenciasDoDocumento(documento: NoDocumento) {
  return (documento.content ?? []).flatMap((bloco) =>
    [...textoDoNo(bloco).matchAll(PENDENCIA)].map(([, texto]) => ({ texto: (texto ?? "").trim() })),
  );
}

export const conteudoPecaSchema = z.object({
  doc: documentoSchema.optional(),
  secoes: z.array(z.object({ titulo: z.string(), texto: z.string() })).optional(),
  aviso: z.string().nullable().optional(),
  pedido: z.string().optional(),
});

export function documentoDoConteudo(conteudo: unknown): NoDocumento {
  const lido = conteudoPecaSchema.safeParse(conteudo).data;
  if (lido?.doc) return lido.doc as NoDocumento;
  return secoesParaDocumento(lido?.secoes ?? []);
}
