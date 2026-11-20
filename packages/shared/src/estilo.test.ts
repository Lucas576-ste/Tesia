import { describe, expect, it } from "vitest";
import { idAprendizado, nivelEstilo, perfilGravadoSchema, proximaAcaoEstilo } from "./estilo";

describe("nivelEstilo", () => {
  it.each([
    [0, "nenhum", 0],
    [1, "basico", 1],
    [4, "basico", 1],
    [5, "bom", 2],
    [7, "bom", 2],
    [8, "otimo", 3],
    [10, "otimo", 3],
  ])("%i peças → %s", (lidas, codigo, indice) => {
    expect(nivelEstilo(lidas)).toMatchObject({ codigo, indice });
  });
});

describe("proximaAcaoEstilo", () => {
  it("diz quantas peças faltam para o próximo nível", () => {
    expect(proximaAcaoEstilo(3)).toBe("Envie mais 2 peças para chegar ao nível Bom.");
    expect(proximaAcaoEstilo(7)).toBe("Envie mais 1 peça para chegar ao nível Ótimo.");
  });

  it("no nível Ótimo avisa que está completo", () => {
    expect(proximaAcaoEstilo(9)).toBe(
      "Seu estilo está completo. A Lia continua aprendendo com as peças que você revisa.",
    );
  });
});

describe("idAprendizado", () => {
  it("é estável e muda com a parte ou o texto", () => {
    expect(idAprendizado("fatos", "Narra em ordem cronológica")).toBe(
      idAprendizado("fatos", "Narra em ordem cronológica"),
    );
    expect(idAprendizado("fatos", "a")).not.toBe(idAprendizado("pedidos", "a"));
  });
});

describe("perfilGravadoSchema", () => {
  it("aceita perfis antigos sem aprendizados", () => {
    const antigo = {
      estrutura_por_tipo: [],
      tom: "",
      tamanho_frases: "curtas",
      citacao_lei: "",
      citacao_jurisprudencia: "",
      referencias_frequentes: [],
      abertura: "",
      fechamento: "",
      expressoes_tipicas: [],
      frases_exibicao: [],
    };
    expect(perfilGravadoSchema.parse(antigo).aprendizados).toEqual([]);
  });
});
