import { describe, expect, it } from "vitest";
import { avisoDeDiaNaoUtil } from "@/lib/recalculo-prazo";

const calendario = { feriados: [], suspensoes: [], recessoCivil: true };

describe("avisoDeDiaNaoUtil", () => {
  it("avisa em sábado", () => {
    expect(avisoDeDiaNaoUtil("2026-11-21", calendario)).toContain("não é dia útil");
  });

  it("não avisa em dia útil nem sem data", () => {
    expect(avisoDeDiaNaoUtil("2026-11-23", calendario)).toBeNull();
    expect(avisoDeDiaNaoUtil("", calendario)).toBeNull();
  });
});
