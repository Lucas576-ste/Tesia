import { describe, expect, it } from "vitest";
import { criarCalendario } from "./calendario";
import { inicioProvavelContagem } from "./inicio-provavel";

const civil = criarCalendario();

describe("inicioProvavelContagem", () => {
  it("diário: publica no dia útil seguinte e conta do dia útil depois", () => {
    const resultado = inicioProvavelContagem(
      { fonte: "diario", disponibilizadaEm: "2026-11-03" },
      civil,
    );
    expect(resultado.referencia).toBe("2026-11-04");
    expect(resultado.inicio).toBe("2026-11-05");
  });

  it("diário: disponibilização na sexta publica na segunda e conta da terça", () => {
    const resultado = inicioProvavelContagem(
      { fonte: "diario", disponibilizadaEm: "2026-11-06" },
      civil,
    );
    expect(resultado.referencia).toBe("2026-11-09");
    expect(resultado.inicio).toBe("2026-11-10");
  });

  it("diário: pula o feriado do escritório", () => {
    const calendario = criarCalendario({
      feriados: [{ data: "2026-11-04", nome: "Feriado local" }],
    });
    const resultado = inicioProvavelContagem(
      { fonte: "diario", disponibilizadaEm: "2026-11-03" },
      calendario,
    );
    expect(resultado.referencia).toBe("2026-11-05");
    expect(resultado.inicio).toBe("2026-11-06");
  });

  it("eletrônico: ciência em 10 dias corridos e início no dia útil seguinte", () => {
    const resultado = inicioProvavelContagem(
      { fonte: "eletronico", disponibilizadaEm: "2026-11-03" },
      civil,
    );
    expect(resultado.referencia).toBe("2026-11-13");
    expect(resultado.inicio).toBe("2026-11-16");
  });

  it("eletrônico: décimo dia em fim de semana adia a ciência para o dia útil", () => {
    const resultado = inicioProvavelContagem(
      { fonte: "eletronico", disponibilizadaEm: "2026-11-05" },
      civil,
    );
    expect(resultado.referencia).toBe("2026-11-16");
    expect(resultado.inicio).toBe("2026-11-17");
  });

  it("explica cada passo", () => {
    const resultado = inicioProvavelContagem(
      { fonte: "diario", disponibilizadaEm: "2026-11-03" },
      civil,
    );
    expect(resultado.memoria).toHaveLength(3);
    expect(resultado.memoria[2]).toContain("Início provável da contagem");
  });
});
