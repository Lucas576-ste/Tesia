import { describe, expect, it } from "vitest";
import { etapaDaFase, faseDoAto, fasesDoRito, normalizarNome } from "./fases";

describe("fases", () => {
  it("cada rito tem a sua sequência", () => {
    expect(fasesDoRito("comum").map((fase) => fase.codigo)).toContain("replica");
    expect(fasesDoRito("jec").map((fase) => fase.codigo)).not.toContain("replica");
    expect(fasesDoRito("trabalhista")[0]?.nome).toBe("Reclamação");
    expect(fasesDoRito("criminal").map((fase) => fase.codigo)).toContain("alegacoes");
    expect(faseDoAto("criminal", "citacao")).toBe("citacao");
    expect(faseDoAto("criminal", "contestacao")).toBe("instrucao");
  });

  it("converte o ato da intimação em fase", () => {
    expect(faseDoAto("comum", "contestacao")).toBe("replica");
    expect(faseDoAto("jef", "contestacao")).toBe("instrucao");
    expect(faseDoAto("trabalhista", "calculos")).toBe("cumprimento");
    expect(faseDoAto("comum", "sentenca")).toBe("sentenca");
    expect(faseDoAto("comum", "despacho")).toBeNull();
  });

  it("agrupa a fase na etapa", () => {
    expect(etapaDaFase("jec", "recurso")).toBe("recurso");
    expect(etapaDaFase("comum", "transito")).toBe("cumprimento");
    expect(etapaDaFase("comum", null)).toBe("inicio");
  });

  it("normaliza nomes para achar o mesmo cliente", () => {
    expect(normalizarNome("José Ribamar")).toBe(normalizarNome("JOSE RIBAMAR"));
    expect(normalizarNome("Banco Horizonte S.A.")).toBe("banco horizonte");
  });
});
