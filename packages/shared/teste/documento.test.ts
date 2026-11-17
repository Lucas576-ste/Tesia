import { describe, expect, it } from "vitest";
import {
  documentoDoConteudo,
  documentoParaSecoes,
  pendenciasDoDocumento,
  secoesParaDocumento,
} from "../src/documento";

const secoes = [
  { titulo: "", texto: "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ" },
  {
    titulo: "I – DOS FATOS",
    texto: "Primeiro parágrafo.\n\nSegundo [CONFIRMAR: data da perícia].",
  },
  { titulo: "II – DO DIREITO", texto: "Art. 479 do CPC [CONFIRMAR: conferir na fonte oficial]." },
];

describe("documento da peça", () => {
  it("seções viram documento e voltam iguais", () => {
    const documento = secoesParaDocumento(secoes);
    expect(documento.content?.[0]?.type).toBe("paragraph");
    expect(documento.content?.[1]?.type).toBe("heading");
    expect(documentoParaSecoes(documento)).toEqual(secoes);
  });

  it("acha as pendências do documento", () => {
    expect(pendenciasDoDocumento(secoesParaDocumento(secoes))).toEqual([
      { texto: "data da perícia" },
      { texto: "conferir na fonte oficial" },
    ]);
  });

  it("aceita o formato antigo com seções e o novo com doc", () => {
    expect(documentoDoConteudo({ secoes }).type).toBe("doc");
    const doc = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "x" }] }],
    };
    expect(documentoDoConteudo({ doc })).toEqual(doc);
  });
});
