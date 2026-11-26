import { describe, expect, it } from "vitest";
import { rotuloDoAto, textoDoPrazo } from "@/lib/resumo-decisao";

const prazo = {
  vencimentoIso: "2026-12-04",
  sugeridoIso: "2026-12-04",
  inicioIso: null,
  internoIso: null,
  dias: 15,
  contagem: "úteis",
  fundamento: "",
  memoria: [],
  regraRevisada: true,
};

describe("textoDoPrazo", () => {
  it("mostra o dia do vencimento sem voltar um dia pelo fuso", () => {
    expect(textoDoPrazo({ prazo, motivoSemPrazo: null }, false)).toBe(
      "Prazo sugerido, ainda sem confirmação: vence em 04/12/2026 (15 dias úteis).",
    );
  });

  it("usa o singular e avisa quando está confirmado", () => {
    expect(textoDoPrazo({ prazo: { ...prazo, dias: 1 }, motivoSemPrazo: null }, true)).toBe(
      "Prazo confirmado: vence em 04/12/2026 (1 dia útil).",
    );
  });

  it("explica quando não há prazo", () => {
    expect(textoDoPrazo({ prazo: null, motivoSemPrazo: "Sem prazo para a parte." }, false)).toBe(
      "Sem prazo para a parte.",
    );
  });
});

describe("rotuloDoAto", () => {
  it("traduz o código do ato", () => {
    expect(rotuloDoAto("sentenca")).toBe("Sentença");
    expect(rotuloDoAto("qualquer")).toBe("Outro ato");
  });
});
