import { describe, expect, it } from "vitest";
import { iniciais, tituloNome } from "./nomes";

describe("tituloNome", () => {
  it("coloca em title case mantendo ligações e siglas", () => {
    expect(tituloNome("MARIA APARECIDA DOS SANTOS LOPES")).toBe("Maria Aparecida dos Santos Lopes");
    expect(tituloNome("MERCADO BOM PREÇO LTDA.")).toBe("Mercado Bom Preço LTDA.");
    expect(tituloNome("josé ribamar e silva")).toBe("José Ribamar e Silva");
    expect(tituloNome("ana-clara souza")).toBe("Ana-Clara Souza");
  });
});

describe("iniciais", () => {
  it("usa a primeira e a última palavra, sem ligações", () => {
    expect(iniciais("MARIA APARECIDA DOS SANTOS LOPES")).toBe("ML");
    expect(iniciais("Juliana")).toBe("J");
    expect(iniciais("CONSTRUTORA PLANALTO LTDA.")).toBe("CP");
    expect(iniciais("")).toBe("?");
  });
});
