export const MODELOS = {
  haiku: "claude-haiku-5-5",
  sonnet: "claude-sonnet-5-5",
} as const;

export type Modelo = (typeof MODELOS)[keyof typeof MODELOS];

export type FaixaPreco = {
  entrada: number;
  saida: number;
  cacheLeitura: number;
  cacheEscrita: number;
};

export type TabelaPreco = {
  padrao: FaixaPreco;
  acima?: { limiteTokens: number; faixa: FaixaPreco };
};

export const PRECOS_POR_MILHAO: Record<Modelo, TabelaPreco> = {
  "claude-haiku-5-5": {
    padrao: { entrada: 0.1, saida: 0.5, cacheLeitura: 0.01, cacheEscrita: 0.125 },
    acima: {
      limiteTokens: 100_000,
      faixa: { entrada: 0.5, saida: 2.5, cacheLeitura: 0.05, cacheEscrita: 0.625 },
    },
  },
  "claude-sonnet-5-5": {
    padrao: { entrada: 2, saida: 10, cacheLeitura: 0.1, cacheEscrita: 2.5 },
  },
};
