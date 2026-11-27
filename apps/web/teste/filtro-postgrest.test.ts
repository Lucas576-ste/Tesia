import { describe, expect, it } from "vitest";
import { valorDeFiltro } from "@/lib/filtro-postgrest";

describe("valorDeFiltro", () => {
  it("mantém vírgula e parênteses dentro das aspas", () => {
    expect(valorDeFiltro("TJDFT, 1ª Vara (Cível)")).toBe('"TJDFT, 1ª Vara (Cível)"');
  });

  it("escapa aspas e barra invertida", () => {
    expect(valorDeFiltro('a"b\\c')).toBe('"a\\"b\\\\c"');
  });
});
