import { describe, expect, it } from "vitest";
import { calcularPrazo, cienciaAutomatica } from "./calcular-prazo";
import { criarCalendario } from "./calendario";

const civil = criarCalendario();
const base = { forma: "portal" as const, dias: 5, contagem: "uteis" as const, fundamento: "CPC" };

describe("cienciaAutomatica", () => {
  it("é o 10º dia corrido após o envio quando ele é útil", () => {
    expect(cienciaAutomatica("2026-11-03", civil)).toBe("2026-11-13");
  });

  it("vai para o primeiro dia útil quando o 10º dia cai no fim de semana", () => {
    expect(cienciaAutomatica("2026-11-04", civil)).toBe("2026-11-16");
  });

  it("vai para o primeiro dia útil quando o 10º dia cai em feriado", () => {
    expect(cienciaAutomatica("2026-11-10", civil)).toBe("2026-11-23");
  });
});

describe("calcularPrazo no portal", () => {
  it("sem abertura, conta a partir da ciência automática", () => {
    const resultado = calcularPrazo({ ...base, dataDisponibilizacao: "2026-11-03" }, civil);
    expect(resultado.ciencia).toBe("2026-11-13");
    expect(resultado.inicio).toBe("2026-11-16");
    expect(resultado.vencimento).toBe("2026-11-23");
    expect(resultado.publicacao).toBeUndefined();
    expect(resultado.memoria[0]).toBe("Enviado no portal do tribunal: 03/11/2026 (terça)");
    expect(resultado.memoria[1]).toContain("Ciência automática: 13/11/2026");
  });

  it("com abertura antes do 10º dia, a ciência é a abertura", () => {
    const resultado = calcularPrazo(
      { ...base, dataDisponibilizacao: "2026-11-03", dataAbertura: "2026-11-05" },
      civil,
    );
    expect(resultado.ciencia).toBe("2026-11-05");
    expect(resultado.inicio).toBe("2026-11-06");
    expect(resultado.vencimento).toBe("2026-11-12");
    expect(resultado.memoria[1]).toContain("aberta");
  });

  it("abertura no mesmo dia do envio começa a contar no dia útil seguinte", () => {
    const resultado = calcularPrazo(
      { ...base, dataDisponibilizacao: "2026-11-06", dataAbertura: "2026-11-06" },
      civil,
    );
    expect(resultado.inicio).toBe("2026-11-09");
  });

  it("abertura depois do 10º dia não adia a ciência automática", () => {
    const resultado = calcularPrazo(
      { ...base, dataDisponibilizacao: "2026-11-03", dataAbertura: "2026-11-20" },
      civil,
    );
    expect(resultado.ciencia).toBe("2026-11-13");
  });

  it("recusa abertura antes do envio", () => {
    expect(() =>
      calcularPrazo(
        { ...base, dataDisponibilizacao: "2026-11-03", dataAbertura: "2026-11-01" },
        civil,
      ),
    ).toThrow();
  });

  it("explica o adiamento quando o 10º dia não é útil", () => {
    const resultado = calcularPrazo({ ...base, dataDisponibilizacao: "2026-11-04" }, civil);
    expect(resultado.memoria[1]).toContain("adiada para o primeiro dia útil");
  });
});
