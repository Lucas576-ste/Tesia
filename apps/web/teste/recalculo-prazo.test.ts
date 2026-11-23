import { describe, expect, it } from "vitest";
import {
  FUNDAMENTO_INFORMADO,
  recalcularPrazo,
  type CalendarioPrazo,
  type RegraPrazo,
} from "@/lib/recalculo-prazo";

const semFeriados: CalendarioPrazo = { feriados: [], suspensoes: [], recessoCivil: true };
const hoje = "2026-09-01";
const recebimento = {
  forma: "diario" as const,
  disponibilizacao: "2026-09-14",
  envio: "",
  abertura: "",
};

function regra(sobre: Partial<RegraPrazo> = {}): RegraPrazo {
  return { dias: 5, contagem: "uteis", fundamento: "CPC, art. 335", revisada: true, ...sobre };
}

describe("recalcularPrazo", () => {
  it("calcula o prazo sem feriado próprio", () => {
    const resultado = recalcularPrazo(regra(), semFeriados, recebimento, hoje);
    expect(resultado?.vencimento).toBe("2026-09-22");
  });

  it("aceita prazo informado à mão, sem fundamento", () => {
    const resultado = recalcularPrazo(regra({ fundamento: "" }), semFeriados, recebimento, hoje);
    expect(resultado?.vencimento).toBe("2026-09-22");
    expect(resultado?.memoria.join(" ")).toContain(FUNDAMENTO_INFORMADO);
  });

  it("trata fundamento só com espaços como vazio", () => {
    const resultado = recalcularPrazo(regra({ fundamento: "   " }), semFeriados, recebimento, hoje);
    expect(resultado?.vencimento).toBe("2026-09-22");
  });

  it("um feriado próprio no meio da contagem empurra o vencimento", () => {
    const calendario: CalendarioPrazo = {
      ...semFeriados,
      feriados: [{ data: "2026-09-17", nome: "Feriado do advogado" }],
    };
    const resultado = recalcularPrazo(regra(), calendario, recebimento, hoje);
    expect(resultado?.vencimento).toBe("2026-09-23");
    expect(resultado?.memoria.join(" ")).toContain("Feriado do advogado");
  });

  it("uma suspensão própria de dois dias empurra dois dias úteis", () => {
    const calendario: CalendarioPrazo = {
      ...semFeriados,
      suspensoes: [{ inicio: "2026-09-17", fim: "2026-09-18", motivo: "Suspensão do advogado" }],
    };
    const resultado = recalcularPrazo(regra(), calendario, recebimento, hoje);
    expect(resultado?.vencimento).toBe("2026-09-24");
  });

  it("um feriado fora da contagem não muda nada", () => {
    const calendario: CalendarioPrazo = {
      ...semFeriados,
      feriados: [{ data: "2026-10-30", nome: "Depois do prazo" }],
    };
    expect(recalcularPrazo(regra(), calendario, recebimento, hoje)?.vencimento).toBe("2026-09-22");
  });
});
