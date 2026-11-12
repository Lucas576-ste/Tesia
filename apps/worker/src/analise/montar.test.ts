import { describe, expect, it } from "vitest";
import {
  calcularPrazoSugerido,
  hojeEmBrasilia,
  montarCalendario,
  motivoSemPrazo,
  opcoesParaIa,
  regraDaPeca,
  ritoParaRegra,
  siglaTribunal,
  type OpcaoBanco,
} from "./montar.js";

const regra = (id: string, dias: number, prioridade: number, ativa = false) => ({
  id,
  dias,
  contagem: "uteis" as const,
  fundamento: `fundamento ${id}`,
  prioridade,
  ativa,
});

const opcoes: OpcaoBanco[] = [
  { codigo: "embargos_declaracao", nome: "Embargos de declaração", regra: regra("e", 5, 2) },
  { codigo: "recurso_inominado", nome: "Recurso inominado", regra: regra("r", 10, 1) },
  { codigo: "manifestacao_simples", nome: "Manifestação simples", regra: null },
];

describe("siglaTribunal", () => {
  it("usa o número CNJ", () => {
    expect(siglaTribunal("1000123-45.2026.4.01.3400", null)).toBe("TRF1");
    expect(siglaTribunal("0000789-12.2026.5.10.0005", null)).toBe("TRT10");
    expect(siglaTribunal("0712345-67.2026.8.07.0001", null)).toBe("TJDFT");
  });

  it("cai no nome do tribunal quando não há número", () => {
    expect(siglaTribunal(null, "trt 10")).toBe("TRT10");
    expect(siglaTribunal(null, "Tribunal qualquer")).toBeNull();
  });
});

describe("opções e regra", () => {
  it("ordena pela prioridade e leva prazo e fundamento para a IA", () => {
    expect(opcoesParaIa(opcoes).map((opcao) => opcao.codigo)).toEqual([
      "recurso_inominado",
      "embargos_declaracao",
      "manifestacao_simples",
    ]);
    expect(opcoesParaIa(opcoes)[0]).toMatchObject({ dias: 10, fundamento: "fundamento r" });
  });

  it("acha a regra da peça escolhida", () => {
    expect(regraDaPeca(opcoes, "embargos_declaracao")?.id).toBe("e");
    expect(regraDaPeca(opcoes, "manifestacao_simples")).toBeNull();
  });
});

describe("calcularPrazoSugerido", () => {
  it("considera o feriado do tribunal", () => {
    const semFeriado = montarCalendario([], [], "jef");
    const comFeriado = montarCalendario(
      [{ data: "2026-12-08", nome: "Dia da Justiça" }],
      [],
      "jef",
    );
    const r = regra("r", 10, 1);
    const sem = calcularPrazoSugerido(r, "2026-11-23", semFeriado, "2026-11-23");
    const com = calcularPrazoSugerido(r, "2026-11-23", comFeriado, "2026-11-23");
    expect(sem?.vencimento).toBe("2026-12-08");
    expect(com?.vencimento).toBe("2026-12-09");
    expect(com?.interno).toBe("2026-12-04");
    expect(com?.memoria.join(" ")).toContain("Dia da Justiça");
  });

  it("sem data ou sem regra, não calcula e explica o motivo", () => {
    const calendario = montarCalendario([], [], "comum");
    expect(calcularPrazoSugerido(null, "2026-11-10", calendario, "2026-11-10")).toBeNull();
    expect(calcularPrazoSugerido(regra("r", 10, 1), null, calendario, "2026-11-10")).toBeNull();
    expect(motivoSemPrazo(null, "2026-11-10")).toContain("regra");
    expect(motivoSemPrazo(regra("r", 10, 1), null)).toContain("data");
    expect(motivoSemPrazo(regra("r", 10, 1), "2026-11-10")).toBeNull();
  });
});

describe("ritoParaRegra", () => {
  it("trata rito não identificado como procedimento comum", () => {
    expect(ritoParaRegra("outro")).toBe("comum");
    expect(ritoParaRegra("jef")).toBe("jef");
  });
});

describe("hojeEmBrasilia", () => {
  it("usa o fuso de Brasília", () => {
    expect(hojeEmBrasilia(new Date("2026-11-12T02:00:00Z"))).toBe("2026-11-11");
  });
});
