import { describe, expect, it } from "vitest";
import { dataDeFiltroCompleta } from "@/lib/intimacoes-lista";
import { lerEmBlocos } from "@/lib/ler-em-blocos";

const fonte = (total: number) => async (indice: number, tamanho: number) =>
  Array.from({ length: total }, (_, item) => item).slice(indice * tamanho, (indice + 1) * tamanho);

describe("lerEmBlocos", () => {
  it("junta os blocos até acabar", async () => {
    expect(await lerEmBlocos(fonte(2300), 5000)).toHaveLength(2300);
    expect(await lerEmBlocos(fonte(1000), 5000)).toHaveLength(1000);
  });

  it("respeita o limite", async () => {
    expect(await lerEmBlocos(fonte(9000), 5000)).toHaveLength(5000);
  });
});

describe("dataDeFiltroCompleta", () => {
  it("espera o ano inteiro antes de filtrar", () => {
    expect(["0002-11-25", "0020-11-25", "0202-11-25"].some(dataDeFiltroCompleta)).toBe(false);
    expect(dataDeFiltroCompleta("2026-11-25")).toBe(true);
    expect(dataDeFiltroCompleta("")).toBe(true);
  });
});
