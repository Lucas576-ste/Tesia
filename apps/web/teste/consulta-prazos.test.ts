import { describe, expect, it } from "vitest";
import { SELECAO_DOS_PRAZOS } from "@/lib/consulta-prazos";

describe("consulta dos prazos", () => {
  it("diz qual relação usar entre prazos e intimações, porque existem duas", () => {
    expect(SELECAO_DOS_PRAZOS).toContain(
      "intimacoes!prazos_intimacao_id_escritorio_id_fkey(extracao)",
    );
    expect(SELECAO_DOS_PRAZOS).not.toMatch(/intimacoes\(/);
  });
});
