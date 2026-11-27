import { describe, expect, it } from "vitest";
import { ROTULOS_MARCO } from "@/lib/prazo-manual";
import { recalcularPrazo } from "@/lib/recalculo-prazo";

describe("cálculo pelo diário", () => {
  it("parte da data de disponibilização", () => {
    const resultado = recalcularPrazo(
      { dias: 5, contagem: "uteis", fundamento: "", revisada: true },
      { feriados: [], suspensoes: [], recessoCivil: true },
      { forma: "diario", disponibilizacao: "2026-11-25", envio: "", abertura: "" },
      "2026-11-25",
    );
    expect(resultado?.inicio).toBe("2026-11-27");
    expect(resultado?.vencimento).toBe("2026-12-03");
    expect(resultado?.memoria.join(" ")).toContain("Disponibilizado no diário: 25/11/2026");
  });

  it("pede a data de disponibilização no rótulo", () => {
    expect(ROTULOS_MARCO.diario).toBe("Disponibilizada no diário em");
  });
});
