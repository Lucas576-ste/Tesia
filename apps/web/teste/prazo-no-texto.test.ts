import { describe, expect, it } from "vitest";
import { avisoDoPrazoCitado, prazosCitados } from "@/lib/prazo-no-texto";

describe("prazosCitados", () => {
  it("acha número, número com extenso entre parênteses e só por extenso", () => {
    expect(
      prazosCitados(
        "Intimem-se no prazo comum de 15 (quinze) dias. Em prazo de quarenta e oito horas. No PRAZO DE 15 DIAS.",
      ),
    ).toEqual([
      { quantidade: 15, unidade: "dias" },
      { quantidade: 48, unidade: "horas" },
    ]);
  });

  it("ignora texto sem prazo", () => {
    expect(prazosCitados("Há 15 dias o autor aguarda.")).toEqual([]);
  });
});

describe("avisoDoPrazoCitado", () => {
  it("avisa quando o texto cita um prazo diferente do sugerido", () => {
    expect(avisoDoPrazoCitado("no prazo de 15 dias", 5)).toBe(
      "O texto cita prazo de 15 dias; a sugestão usa 5 dias. Confira antes de confirmar.",
    );
  });

  it("lista todos quando há mais de um", () => {
    expect(avisoDoPrazoCitado("prazo de 5 dias e prazo de 1 hora", null)).toBe(
      "O texto cita prazos de 5 dias e 1 hora. Confira antes de confirmar.",
    );
  });

  it("não avisa quando confere ou não há prazo no texto", () => {
    expect(avisoDoPrazoCitado("no prazo de 15 (quinze) dias úteis", 15)).toBeNull();
    expect(avisoDoPrazoCitado("sem menção", 5)).toBeNull();
  });
});
