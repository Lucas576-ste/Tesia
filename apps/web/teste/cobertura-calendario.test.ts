import { describe, expect, it } from "vitest";
import { avisoDeCalendario, montarCobertura } from "@/lib/cobertura-calendario";

const escritorio = "00000000-0000-4000-8000-000000000001";

function feriado(tribunal: string | null, data: string, dono: string | null = null) {
  return { data, tribunal, abrangencia: "tribunal", escritorio_id: dono };
}

describe("montarCobertura", () => {
  it("conta todos os anos de uma suspensão oficial", () => {
    const suspensao = {
      inicio: "2026-12-20",
      fim: "2027-01-20",
      tribunal: "TRF1",
      escritorio_id: null,
    };
    expect(montarCobertura("TRF1", [], [suspensao]).anos).toEqual([2026, 2027]);
  });

  it("ignora feriado nacional, estadual e de outro tribunal", () => {
    const feriados = [
      { ...feriado(null, "2026-04-21"), abrangencia: "nacional" },
      { ...feriado(null, "2026-11-30"), abrangencia: "estadual" },
      feriado("TRT10", "2026-12-08"),
    ];
    expect(montarCobertura("TRF1", feriados, []).anos).toEqual([]);
  });
});

describe("avisoDeCalendario", () => {
  it("avisa no TJDFT sem linhas", () => {
    const cobertura = montarCobertura("TJDFT", [], []);
    expect(avisoDeCalendario(cobertura, ["2026-11-25"])).toContain("calendário oficial do TJDFT");
    expect(avisoDeCalendario(cobertura, [])).not.toBeNull();
  });

  it("não avisa no TRF1 com 2026 cadastrado", () => {
    const cobertura = montarCobertura("TRF1", [feriado("TRF1", "2026-12-08")], []);
    expect(avisoDeCalendario(cobertura, ["2026-11-25", "", null, "2026-12-03"])).toBeNull();
    expect(avisoDeCalendario(cobertura, [])).toBeNull();
  });

  it("avisa quando a conta entra em 2028", () => {
    const cobertura = montarCobertura(
      "TRF1",
      [feriado("TRF1", "2026-12-08"), feriado("TRF1", "2027-12-08")],
      [],
    );
    expect(avisoDeCalendario(cobertura, ["2027-12-15", "2028-02-03"])).not.toBeNull();
  });

  it("avisa quando só há item do escritório", () => {
    const cobertura = montarCobertura("TJDFT", [feriado("TJDFT", "2026-12-08", escritorio)], []);
    expect(avisoDeCalendario(cobertura, ["2026-11-25"])).not.toBeNull();
  });

  it("avisa sem tribunal identificado", () => {
    const cobertura = montarCobertura(null, [feriado("TRF1", "2026-12-08")], []);
    expect(avisoDeCalendario(cobertura, ["2026-11-25"])).toContain("não foi identificado");
  });
});
