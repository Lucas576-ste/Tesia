import { describe, expect, it } from "vitest";
import { agruparPresets, calculoPrazoSchema, rotuloPreset } from "./prazo-manual";

const base = {
  peca: "Contestação",
  dias: 15,
  contagem: "uteis" as const,
  fundamento: "CPC, art. 335",
  revisada: true,
};

describe("agruparPresets", () => {
  it("junta regras iguais e ordena por peça e dias", () => {
    const presets = agruparPresets([
      { ...base, id: "a" },
      { ...base, id: "b", revisada: false },
      { ...base, id: "c", peca: "Apelação", dias: 15, fundamento: "CPC, art. 1.003, §5º" },
      { ...base, id: "d", peca: "Apelação", dias: 5, fundamento: "CPC, art. 1.023" },
    ]);
    expect(presets.map((preset) => `${preset.peca}:${preset.dias}`)).toEqual([
      "Apelação:5",
      "Apelação:15",
      "Contestação:15",
    ]);
    expect(presets.find((preset) => preset.peca === "Contestação")?.revisada).toBe(false);
  });

  it("monta o rótulo do atalho", () => {
    expect(rotuloPreset({ ...base, id: "a" })).toBe("Contestação · 15 dias úteis (CPC, art. 335)");
    expect(rotuloPreset({ ...base, id: "a", contagem: "corridos", dias: 5 })).toBe(
      "Contestação · 5 dias corridos (CPC, art. 335)",
    );
  });
});

describe("calculoPrazoSchema", () => {
  const entrada = {
    forma: "diario",
    marco: "2026-11-19",
    abertura: "",
    dias: 15,
    contagem: "uteis",
    fundamento: "",
    regraId: "",
  };

  it("aceita um cálculo válido e recusa dias fora do limite", () => {
    expect(calculoPrazoSchema.safeParse(entrada).success).toBe(true);
    expect(calculoPrazoSchema.safeParse({ ...entrada, dias: 0 }).success).toBe(false);
    expect(calculoPrazoSchema.safeParse({ ...entrada, dias: 400 }).success).toBe(false);
    expect(calculoPrazoSchema.safeParse({ ...entrada, marco: "" }).success).toBe(false);
  });
});
