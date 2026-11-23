import { describe, expect, it } from "vitest";
import {
  diasDoPeriodo,
  entradaCalendarioSchema,
  ordenarItens,
  rotuloDoEscopo,
  rotuloDoItem,
  textoAvisoPrazos,
  type ItemCalendario,
} from "@/lib/calendario-proprio";
import { hojeBrasilia } from "@/lib/hoje";

function somarDias(iso: string, dias: number) {
  const data = new Date(`${iso}T12:00:00Z`);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

const hoje = hojeBrasilia();

describe("entradaCalendarioSchema", () => {
  it("aceita um dia só e deixa o escopo em branco como todos", () => {
    const lida = entradaCalendarioSchema.parse({
      data: somarDias(hoje, 30),
      descricao: "  Dia do padroeiro ",
    });
    expect(lida).toMatchObject({ descricao: "Dia do padroeiro", ate: "", tribunal: null });
  });

  it("guarda o tribunal escolhido", () => {
    const lida = entradaCalendarioSchema.parse({
      data: somarDias(hoje, 30),
      descricao: "Recesso local",
      tribunal: " TRT10 ",
    });
    expect(lida.tribunal).toBe("TRT10");
  });

  it("trata data final igual à inicial como um dia só", () => {
    const dia = somarDias(hoje, 30);
    expect(entradaCalendarioSchema.parse({ data: dia, ate: dia, descricao: "Feriado" }).ate).toBe(
      "",
    );
  });

  it("aceita um período", () => {
    const inicio = somarDias(hoje, 30);
    const fim = somarDias(hoje, 34);
    expect(
      entradaCalendarioSchema.parse({ data: inicio, ate: fim, descricao: "Suspensão" }).ate,
    ).toBe(fim);
  });

  it("recusa data final antes da inicial", () => {
    const resultado = entradaCalendarioSchema.safeParse({
      data: somarDias(hoje, 30),
      ate: somarDias(hoje, 20),
      descricao: "Suspensão",
    });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.path).toEqual(["ate"]);
  });

  it("recusa período de mais de 365 dias e aceita exatamente 365", () => {
    const inicio = somarDias(hoje, 10);
    const longo = entradaCalendarioSchema.safeParse({
      data: inicio,
      ate: somarDias(inicio, 365),
      descricao: "Suspensão",
    });
    expect(longo.success).toBe(false);
    const limite = entradaCalendarioSchema.safeParse({
      data: inicio,
      ate: somarDias(inicio, 364),
      descricao: "Suspensão",
    });
    expect(limite.success).toBe(true);
  });

  it("recusa descrição curta, data inválida e datas fora da janela", () => {
    expect(
      entradaCalendarioSchema.safeParse({ data: somarDias(hoje, 5), descricao: "ab" }).success,
    ).toBe(false);
    expect(
      entradaCalendarioSchema.safeParse({ data: "31/12/2026", descricao: "Feriado" }).success,
    ).toBe(false);
    expect(
      entradaCalendarioSchema.safeParse({ data: somarDias(hoje, -900), descricao: "Feriado" })
        .success,
    ).toBe(false);
    expect(
      entradaCalendarioSchema.safeParse({ data: somarDias(hoje, 2000), descricao: "Feriado" })
        .success,
    ).toBe(false);
  });

  it("aceita uma data no passado recente, para conferir cálculos antigos", () => {
    expect(
      entradaCalendarioSchema.safeParse({ data: somarDias(hoje, -60), descricao: "Feriado" })
        .success,
    ).toBe(true);
  });
});

describe("diasDoPeriodo", () => {
  it("conta os dois extremos", () => {
    expect(diasDoPeriodo("2026-12-21", "2026-12-21")).toBe(1);
    expect(diasDoPeriodo("2026-12-30", "2027-01-02")).toBe(4);
    expect(diasDoPeriodo("2028-02-28", "2028-03-01")).toBe(3);
  });
});

describe("rótulos e ordenação", () => {
  const dia: ItemCalendario = {
    id: "1",
    tipo: "dia",
    data: "2026-12-08",
    ate: null,
    descricao: "Dia da Justiça",
    tribunal: null,
  };
  const periodo: ItemCalendario = {
    id: "2",
    tipo: "periodo",
    data: "2026-12-21",
    ate: "2027-01-06",
    descricao: "Suspensão",
    tribunal: "TJDFT",
  };

  it("escreve a data e o período em português", () => {
    expect(rotuloDoItem(dia)).toBe("08/12/2026");
    expect(rotuloDoItem(periodo)).toBe("21/12/2026 a 06/01/2027");
  });

  it("escreve o escopo", () => {
    expect(rotuloDoEscopo(null)).toBe("Todos os processos");
    expect(rotuloDoEscopo("TJDFT")).toBe("Só TJDFT");
  });

  it("ordena por data sem mexer na lista original", () => {
    const lista = [periodo, dia];
    expect(ordenarItens(lista).map(({ id }) => id)).toEqual(["1", "2"]);
    expect(lista.map(({ id }) => id)).toEqual(["2", "1"]);
  });
});

describe("textoAvisoPrazos", () => {
  it("não avisa quando nenhum prazo é afetado", () => {
    expect(textoAvisoPrazos(0)).toBeNull();
  });

  it("concorda no singular e no plural", () => {
    expect(textoAvisoPrazos(1)).toContain("1 prazo aberto vence");
    expect(textoAvisoPrazos(4)).toContain("4 prazos abertos vencem");
    expect(textoAvisoPrazos(4)).toContain("não mudam sozinhos");
  });
});
