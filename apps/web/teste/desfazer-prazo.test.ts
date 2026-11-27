import { describe, expect, it } from "vitest";
import { statusSemConclusao } from "@/lib/prazo";

describe("statusSemConclusao", () => {
  it("volta para rascunho pronto quando há peça", () => {
    expect(statusSemConclusao({ pecaId: "peca-1" })).toBe("rascunho_pronto");
  });

  it("volta para não iniciado sem peça", () => {
    expect(statusSemConclusao({})).toBe("nao_iniciado");
  });
});
