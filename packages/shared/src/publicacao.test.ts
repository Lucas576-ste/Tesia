import { describe, expect, it } from "vitest";
import {
  classificarPublicacao,
  formatarCnj,
  normalizarCnj,
  podeDesvincularProcesso,
  podeGerenciarTermos,
} from "./publicacao";

describe("normalizarCnj", () => {
  it("aceita com e sem pontuação", () => {
    expect(normalizarCnj("0723456-78.2026.8.07.0001")).toBe("07234567820268070001");
    expect(normalizarCnj("07234567820268070001")).toBe("07234567820268070001");
  });
  it("recusa número com tamanho errado ou vazio", () => {
    expect(normalizarCnj("123")).toBeNull();
    expect(normalizarCnj(null)).toBeNull();
    expect(normalizarCnj("AREsp 3320005/SP (2026/0288907-6)")).toBeNull();
  });
  it("formata de volta no padrão do CNJ", () => {
    expect(formatarCnj("07234567820268070001")).toBe("0723456-78.2026.8.07.0001");
  });
});

describe("classificarPublicacao", () => {
  it("trata ata de distribuição como andamento, mesmo vinda como intimação", () => {
    expect(classificarPublicacao({ tipoDocumento: "ATA DE DISTRIBUIÇÃO", texto: "x" })).toBe(
      "andamento",
    );
  });
  it("reconhece o aviso de distribuição pelo texto", () => {
    const texto =
      "<table><tr><td>RELATOR</td><td>MINISTRO X</td></tr></table><p>Processo distribuído pelo sistema automático em 13/11/2026.</p>";
    expect(classificarPublicacao({ tipoDocumento: "DESPACHO / DECISÃO", texto })).toBe("andamento");
  });
  it("mantém decisão, sentença e citação como intimação", () => {
    expect(classificarPublicacao({ tipoDocumento: "Sentença", texto: "Intimem-se." })).toBe(
      "intimacao",
    );
    expect(classificarPublicacao({ tipoDocumento: "Decisão", texto: "Cite-se o réu." })).toBe(
      "intimacao",
    );
  });
  it("na dúvida, é intimação", () => {
    expect(classificarPublicacao({})).toBe("intimacao");
    expect(
      classificarPublicacao({
        texto: "Fica intimado. Processo distribuído pelo sistema automático em 01/01/2026.",
      }),
    ).toBe("intimacao");
  });
});

describe("permissões", () => {
  it("só o dono desvincula processo", () => {
    expect(podeDesvincularProcesso("dono")).toBe(true);
    expect(podeDesvincularProcesso("advogado")).toBe(false);
    expect(podeDesvincularProcesso("estagiario")).toBe(false);
  });
  it("estagiário não gerencia termos", () => {
    expect(podeGerenciarTermos("dono")).toBe(true);
    expect(podeGerenciarTermos("advogado")).toBe(true);
    expect(podeGerenciarTermos("estagiario")).toBe(false);
  });
});
