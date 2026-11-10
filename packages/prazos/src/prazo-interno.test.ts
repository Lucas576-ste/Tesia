import { describe, expect, it } from "vitest";
import { criarCalendario } from "./calendario";
import { calcularPrazoInterno } from "./prazo-interno";

const calendario = criarCalendario();
const hoje = "2026-11-04";

describe("calcularPrazoInterno", () => {
  it.each([
    ["volta 2 dias úteis", "2026-11-18", "2026-11-16"],
    ["pula feriado e fim de semana", "2026-11-23", "2026-11-18"],
    ["usa hoje quando o fatal é hoje", "2026-11-04", "2026-11-04"],
    ["usa hoje quando o fatal é amanhã", "2026-11-05", "2026-11-04"],
    ["usa o fatal quando ele já passou", "2026-11-03", "2026-11-03"],
  ])("%s", (_, fatal, esperado) => {
    expect(calcularPrazoInterno({ fatal, hoje, calendario })).toBe(esperado);
  });

  it("aceita outra antecedência", () => {
    expect(calcularPrazoInterno({ fatal: "2026-11-18", hoje, calendario, diasUteis: 3 })).toBe(
      "2026-11-13",
    );
  });
});
