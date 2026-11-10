import { describe, expect, it } from "vitest";
import { feriadosNacionais, pascoa } from "./feriados";

describe("pascoa", () => {
  it.each([
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
    [2030, "2030-04-21"],
  ])("calcula a Páscoa de %i", (ano, esperado) => {
    expect(pascoa(ano)).toBe(esperado);
  });
});

describe("feriadosNacionais", () => {
  it("lista fixos e móveis de 2026 em ordem", () => {
    const datas = feriadosNacionais(2026).map((feriado) => feriado.data);
    expect(datas).toEqual([
      "2026-01-01",
      "2026-02-16",
      "2026-02-17",
      "2026-04-03",
      "2026-04-21",
      "2026-05-01",
      "2026-06-04",
      "2026-09-07",
      "2026-10-12",
      "2026-11-02",
      "2026-11-15",
      "2026-11-20",
      "2026-12-25",
    ]);
  });

  it("marca Carnaval e Corpus Christi como forense", () => {
    const forenses = feriadosNacionais(2026)
      .filter((feriado) => feriado.tipo === "forense")
      .map((feriado) => feriado.nome);
    expect(forenses).toEqual(["Carnaval", "Carnaval", "Corpus Christi"]);
  });
});
