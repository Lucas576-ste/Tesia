import { describe, expect, it } from "vitest";
import { calcularCusto } from "../src/custo.js";

const uso = (entrada: number, saida: number, leitura = 0, escrita = 0) => ({
  input_tokens: entrada,
  output_tokens: saida,
  cache_read_input_tokens: leitura,
  cache_creation_input_tokens: escrita,
});

describe("calcularCusto", () => {
  it("calcula o Haiku na faixa padrão", () => {
    const resultado = calcularCusto("claude-haiku-5-5", uso(10_000, 2_000));
    expect(resultado.custoEstimado).toBeCloseTo(0.002, 6);
    expect(resultado.tokensEntrada).toBe(10_000);
    expect(resultado.tokensSaida).toBe(2_000);
  });

  it("usa a faixa acima de 100 mil tokens do Haiku", () => {
    const resultado = calcularCusto("claude-haiku-5-5", uso(200_000, 1_000));
    expect(resultado.custoEstimado).toBeCloseTo(0.1025, 6);
  });

  it("soma leitura e escrita de cache", () => {
    const resultado = calcularCusto("claude-sonnet-5-5", uso(1_000, 1_000, 10_000, 4_000));
    expect(resultado.tokensCache).toBe(14_000);
    expect(resultado.custoEstimado).toBeCloseTo(0.023, 6);
  });

  it("trata tokens nulos como zero", () => {
    const resultado = calcularCusto("claude-haiku-5-5", {
      input_tokens: null,
      output_tokens: 0,
      cache_read_input_tokens: null,
      cache_creation_input_tokens: null,
    });
    expect(resultado.custoEstimado).toBe(0);
  });
});
