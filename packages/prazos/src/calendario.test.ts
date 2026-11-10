import { describe, expect, it } from "vitest";
import { MOTIVO_RECESSO, criarCalendario, ehDiaUtil, proximoDiaUtil } from "./calendario";

describe("criarCalendario", () => {
  const calendario = criarCalendario();

  it("trata fim de semana e feriado nacional como não útil", () => {
    expect(ehDiaUtil("2026-11-07", calendario)).toBe(false);
    expect(calendario.motivoNaoUtil("2026-11-20")).toBe(
      "Dia Nacional de Zumbi e da Consciência Negra",
    );
    expect(ehDiaUtil("2026-11-19", calendario)).toBe(true);
  });

  it("aplica o recesso de 20/12 a 20/01 só quando ligado", () => {
    expect(calendario.motivoNaoUtil("2026-12-21")).toBe(MOTIVO_RECESSO);
    expect(calendario.motivoNaoUtil("2027-01-20")).toBe(MOTIVO_RECESSO);
    expect(ehDiaUtil("2027-01-21", calendario)).toBe(true);
    expect(ehDiaUtil("2026-12-21", criarCalendario({ recessoCivil: false }))).toBe(true);
  });

  it("considera feriados extras e suspensões do tribunal", () => {
    const local = criarCalendario({
      feriados: [{ data: "2026-11-30", nome: "Feriado do tribunal" }],
      suspensoes: [{ inicio: "2026-12-01", fim: "2026-12-02", motivo: "Sistema fora do ar" }],
    });
    expect(local.motivoNaoUtil("2026-11-30")).toBe("Feriado do tribunal");
    expect(local.motivoNaoUtil("2026-12-02")).toBe("Sistema fora do ar");
    expect(proximoDiaUtil("2026-11-27", local)).toBe("2026-12-03");
  });

  it("rejeita data inválida", () => {
    expect(() => criarCalendario({ feriados: [{ data: "30/11/2026", nome: "x" }] })).toThrow();
  });
});
