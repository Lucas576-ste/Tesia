import { describe, expect, it } from "vitest";
import { agruparPresets, nomeDaPeca, rotuloPreset, type RegraParaPreset } from "@/lib/prazo-manual";

const nomes = new Map([
  ["civel|contestacao", "Contestação"],
  ["civel|apelacao", "Apelação"],
  ["geral|embargos_declaracao", "Embargos de declaração"],
  ["geral|agravo_instrumento", "Agravo de instrumento"],
  ["trabalhista|embargos_declaracao", "Embargos (trabalhista)"],
]);

describe("nomeDaPeca", () => {
  it("usa o nome da própria área quando existe", () => {
    expect(nomeDaPeca(nomes, "civel", "contestacao")).toBe("Contestação");
    expect(nomeDaPeca(nomes, "trabalhista", "embargos_declaracao")).toBe("Embargos (trabalhista)");
  });

  it("cai para o nome da área geral quando a área não tem", () => {
    expect(nomeDaPeca(nomes, "familia", "embargos_declaracao")).toBe("Embargos de declaração");
    expect(nomeDaPeca(nomes, "criminal", "agravo_instrumento")).toBe("Agravo de instrumento");
  });

  it("só mostra o código quando nenhum nome existe", () => {
    expect(nomeDaPeca(nomes, "civel", "peca_desconhecida")).toBe("peca_desconhecida");
    expect(nomeDaPeca(new Map(), "civel", "contestacao")).toBe("contestacao");
  });

  it("não usa o nome de outra área", () => {
    expect(nomeDaPeca(nomes, "trabalhista", "contestacao")).toBe("contestacao");
  });
});

describe("rotuloPreset", () => {
  it("escreve peça, prazo e base legal", () => {
    const base = { id: "1", peca: "Apelação", fundamento: "CPC, art. 1.003, §5º", revisada: true };
    expect(rotuloPreset({ ...base, dias: 15, contagem: "uteis" })).toBe(
      "Apelação · 15 dias úteis (CPC, art. 1.003, §5º)",
    );
    expect(
      rotuloPreset({ ...base, peca: "Resposta à acusação", dias: 10, contagem: "corridos" }),
    ).toContain("10 dias corridos");
  });
});

describe("agruparPresets", () => {
  const regra = (id: string, sobre: Partial<RegraParaPreset> = {}): RegraParaPreset => ({
    id,
    peca: "Embargos de declaração",
    dias: 5,
    contagem: "uteis",
    fundamento: "CPC, art. 1.023",
    revisada: true,
    ...sobre,
  });

  it("junta a mesma peça de áreas diferentes numa só opção", () => {
    const grupos = agruparPresets([regra("a"), regra("b"), regra("c")]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0]?.peca).toBe("Embargos de declaração");
  });

  it("só considera revisada se todas as regras do grupo forem", () => {
    expect(agruparPresets([regra("a"), regra("b", { revisada: false })])[0]?.revisada).toBe(false);
    expect(agruparPresets([regra("a"), regra("b")])[0]?.revisada).toBe(true);
  });

  it("mantém separadas as regras com prazo ou base legal diferentes", () => {
    const grupos = agruparPresets([
      regra("a"),
      regra("b", { dias: 2, contagem: "corridos", fundamento: "CPP, arts. 382 e 798" }),
    ]);
    expect(grupos).toHaveLength(2);
  });

  it("ordena por nome da peça e depois por dias", () => {
    const grupos = agruparPresets([
      regra("a", { peca: "Réplica", dias: 15 }),
      regra("b", { peca: "Apelação", dias: 15, fundamento: "x" }),
      regra("c", { peca: "Apelação", dias: 5, fundamento: "y" }),
    ]);
    expect(grupos.map(({ peca, dias }) => `${peca}${dias}`)).toEqual([
      "Apelação5",
      "Apelação15",
      "Réplica15",
    ]);
  });
});
