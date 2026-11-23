import { describe, expect, it } from "vitest";
import {
  faixasEmOrdem,
  metricasSchema,
  textoVariacao,
  variacaoMensal,
} from "@/lib/clientes-metricas";

describe("variacaoMensal", () => {
  it("calcula o percentual sobre o mês anterior", () => {
    expect(variacaoMensal(15, 10)).toEqual({ tipo: "variou", percentual: 50 });
    expect(variacaoMensal(5, 10)).toEqual({ tipo: "variou", percentual: -50 });
  });

  it("trata mês anterior zerado sem dividir por zero", () => {
    expect(variacaoMensal(3, 0)).toEqual({ tipo: "novo" });
    expect(variacaoMensal(0, 0)).toEqual({ tipo: "igual" });
  });

  it("considera igual quando o arredondamento dá zero", () => {
    expect(variacaoMensal(200, 201)).toEqual({ tipo: "igual", percentual: 0 });
  });
});

describe("textoVariacao", () => {
  it("escreve a frase para a tela", () => {
    expect(textoVariacao(15, 10)).toBe("+50% sobre o mês anterior");
    expect(textoVariacao(5, 10)).toBe("-50% sobre o mês anterior");
    expect(textoVariacao(4, 4)).toBe("Igual ao mês anterior");
    expect(textoVariacao(2, 0)).toBe("Sem cadastros no mês anterior");
  });
});

describe("faixasEmOrdem", () => {
  it("devolve todas as faixas na ordem, zerando as que faltam", () => {
    const resultado = faixasEmOrdem([
      { chave: "sem_data", total: 2 },
      { chave: "36_50", total: 7 },
    ]);
    expect(resultado.map(({ faixa }) => faixa)).toEqual([
      "ate_25",
      "26_35",
      "36_50",
      "51_65",
      "66_mais",
      "sem_data",
    ]);
    expect(resultado.find(({ faixa }) => faixa === "36_50")?.total).toBe(7);
    expect(resultado.find(({ faixa }) => faixa === "ate_25")?.total).toBe(0);
  });
});

describe("metricasSchema", () => {
  const base = {
    total: 3,
    novos_mes_atual: 1,
    novos_mes_anterior: 0,
    com_processo: 1,
    sem_processo: 2,
  };

  it("aceita a linha da função do banco", () => {
    const lida = metricasSchema.parse({
      ...base,
      top_origens: [{ chave: "google", total: 2 }],
      faixas_etarias: [],
      top_profissoes: [],
      ufs: ["DF"],
      cidades: ["Brasília"],
    });
    expect(lida.top_origens[0]).toEqual({ chave: "google", total: 2 });
  });

  it("usa listas vazias quando o banco devolve algo torto", () => {
    const lida = metricasSchema.parse({ ...base, top_origens: null, ufs: "DF" });
    expect(lida.top_origens).toEqual([]);
    expect(lida.ufs).toEqual([]);
  });

  it("recusa quando faltam os totais", () => {
    expect(metricasSchema.safeParse({ total: 1 }).success).toBe(false);
  });
});
