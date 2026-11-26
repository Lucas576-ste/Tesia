import { describe, expect, it } from "vitest";
import {
  mailtoDaIntimacao,
  podeTratarIntimacao,
  resumoDoLote,
  termoDeBuscaDeProcesso,
} from "@/lib/tratamento-intimacao";

describe("podeTratarIntimacao", () => {
  it("só o responsável trata; sem responsável, qualquer um", () => {
    expect(podeTratarIntimacao("u1", "u1")).toBe(true);
    expect(podeTratarIntimacao("u1", "u2")).toBe(false);
    expect(podeTratarIntimacao(null, "u2")).toBe(true);
  });
});

describe("resumoDoLote", () => {
  it("conta o que foi feito e o que ficou de fora", () => {
    expect(resumoDoLote(1, 0, "concluída")).toBe("1 intimação concluída.");
    expect(resumoDoLote(3, 0, "concluídas")).toBe("3 intimações concluídas.");
    expect(resumoDoLote(2, 1, "concluídas")).toContain("1 intimação ficou de fora");
    expect(resumoDoLote(2, 2, "concluídas")).toContain("2 intimações ficaram de fora");
    expect(resumoDoLote(0, 2, "concluídas")).toContain("Nenhuma intimação");
  });
});

describe("mailtoDaIntimacao", () => {
  it("monta assunto e corpo com o CNJ formatado e codificado", () => {
    const link = mailtoDaIntimacao({
      numeroProcesso: "07234567820268070001",
      tribunal: "TJDFT",
      publicadaEm: "13/11/2026",
      texto: "Fica intimado & notificado.",
    });
    expect(link.startsWith("mailto:?subject=")).toBe(true);
    expect(decodeURIComponent(link)).toContain("Intimação · 0723456-78.2026.8.07.0001");
    expect(decodeURIComponent(link)).toContain("Fica intimado & notificado.");
    expect(link).not.toContain(" ");
  });
  it("limita o tamanho do texto e aceita processo sem número", () => {
    const link = mailtoDaIntimacao({
      numeroProcesso: null,
      tribunal: null,
      publicadaEm: null,
      texto: "x".repeat(5000),
    });
    expect(decodeURIComponent(link)).toContain("processo sem número");
    expect(link.length).toBeLessThan(2600);
  });
});

describe("termoDeBuscaDeProcesso", () => {
  it("reconhece CNJ com ou sem pontuação", () => {
    expect(termoDeBuscaDeProcesso("07234567820268070001")).toEqual({
      tipo: "cnj",
      valor: "0723456-78.2026.8.07.0001",
    });
  });
  it("limpa caracteres que quebram o filtro e recusa busca curta", () => {
    expect(termoDeBuscaDeProcesso("Silva, (Maria)%")).toEqual({
      tipo: "texto",
      valor: "Silva Maria",
    });
    expect(termoDeBuscaDeProcesso("ab")).toBeNull();
  });
});
