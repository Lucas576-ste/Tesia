import { PRECOS_POR_MILHAO, type Modelo } from "./modelos.js";

export type UsoApi = {
  input_tokens: number | null;
  output_tokens: number;
  cache_read_input_tokens: number | null;
  cache_creation_input_tokens: number | null;
};

export type UsoIa = {
  modelo: Modelo;
  tokensEntrada: number;
  tokensCache: number;
  tokensSaida: number;
  custoEstimado: number;
};

export function calcularCusto(modelo: Modelo, uso: UsoApi): UsoIa {
  const entrada = uso.input_tokens ?? 0;
  const leitura = uso.cache_read_input_tokens ?? 0;
  const escrita = uso.cache_creation_input_tokens ?? 0;
  const saida = uso.output_tokens;
  const tabela = PRECOS_POR_MILHAO[modelo];
  const totalPrompt = entrada + leitura + escrita;
  const faixa =
    tabela.acima && totalPrompt > tabela.acima.limiteTokens ? tabela.acima.faixa : tabela.padrao;
  const custo =
    (entrada * faixa.entrada +
      saida * faixa.saida +
      leitura * faixa.cacheLeitura +
      escrita * faixa.cacheEscrita) /
    1_000_000;
  return {
    modelo,
    tokensEntrada: entrada,
    tokensCache: leitura + escrita,
    tokensSaida: saida,
    custoEstimado: Math.round(custo * 1_000_000) / 1_000_000,
  };
}
