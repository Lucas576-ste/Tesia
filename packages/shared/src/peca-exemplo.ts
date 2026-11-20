import type { NoDocumento } from "./documento";

function texto(valor: string): NoDocumento {
  return { type: "text", text: valor };
}

export const PECA_EXEMPLO: NoDocumento = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [texto("EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA 1ª VARA CÍVEL")],
    },
    { type: "heading", attrs: { level: 3 }, content: [texto("CONTESTAÇÃO")] },
    {
      type: "paragraph",
      content: [
        texto(
          "Maria Souza, já qualificada nos autos, vem apresentar contestação à ação movida por Banco X, pelos fatos e fundamentos a seguir.",
        ),
      ],
    },
    {
      type: "paragraph",
      content: [texto("O autor não juntou o contrato que fundamenta a cobrança.")],
    },
    { type: "paragraph", content: [texto("Nestes termos, pede deferimento.")] },
    { type: "paragraph", content: [texto("Brasília, 25 de novembro de 2026.")] },
  ],
};
