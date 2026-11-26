import { describe, expect, it } from "vitest";
import {
  estadoBanner,
  formatarOabDaBusca,
  lerOabDaBusca,
  planoTemBusca,
  podeBuscarAgora,
} from "@/lib/busca-oab";
import { perfilSchema } from "@/lib/onboarding";

const base = {
  aceitou: false,
  temOab: true,
  comFalha: false,
  ultimaBusca: null,
  podeGerenciar: true,
  temPlano: true,
};

describe("estadoBanner", () => {
  it("convida quem ainda não aceitou e tem OAB", () => {
    expect(estadoBanner(base)).toBe("convite");
  });

  it("pede para completar a OAB quando ela falta", () => {
    expect(estadoBanner({ ...base, temOab: false })).toBe("completarOab");
  });

  it("mostra monitorando depois do aceite", () => {
    expect(estadoBanner({ ...base, aceitou: true, ultimaBusca: "2026-11-25T10:00:00Z" })).toBe(
      "monitorando",
    );
  });

  it("mostra falha quando o termo tem problema", () => {
    expect(estadoBanner({ ...base, aceitou: true, comFalha: true })).toBe("falha");
  });

  it("não convida o estagiário, mas deixa ele ver o estado", () => {
    expect(estadoBanner({ ...base, podeGerenciar: false })).toBeNull();
    expect(estadoBanner({ ...base, aceitou: true, podeGerenciar: false })).toBe("monitorando");
  });
});

describe("lerOabDaBusca", () => {
  it("normaliza o número sem pontuação nem zeros à esquerda", () => {
    const oab = lerOabDaBusca("000.555", "DF");
    expect(oab).toEqual({ numero: "555", uf: "DF" });
    expect(oab && formatarOabDaBusca(oab)).toBe("555/DF");
  });

  it("recusa número vazio, só zeros e UF inválida", () => {
    expect(lerOabDaBusca("", "DF")).toBeNull();
    expect(lerOabDaBusca("000", "DF")).toBeNull();
    expect(lerOabDaBusca("123", "XX")).toBeNull();
    expect(lerOabDaBusca(null, null)).toBeNull();
  });
});

describe("podeBuscarAgora", () => {
  it("só libera fora de produção", () => {
    expect(podeBuscarAgora("development")).toBe(true);
    expect(podeBuscarAgora("test")).toBe(true);
    expect(podeBuscarAgora("production")).toBe(false);
  });
});

describe("número da OAB", () => {
  const perfil = { uf: "DF", areas: ["Trabalhista"], tribunais: [], whatsapp: "" };

  it.each(["1", "123456", "12.345", "12345-A", "012345"])("aceita %s", (oab) => {
    expect(lerOabDaBusca(oab, "DF")).not.toBeNull();
    expect(perfilSchema.safeParse({ ...perfil, oab }).success).toBe(true);
  });

  it.each(["1234567", "12345678901", "12a45", "OAB 123", "000"])("recusa %s", (oab) => {
    expect(lerOabDaBusca(oab, "DF")).toBeNull();
    expect(perfilSchema.safeParse({ ...perfil, oab }).success).toBe(false);
  });
});

describe("plano com busca automática", () => {
  it("segue a mesma regra do worker", () => {
    expect(planoTemBusca("trial", null)).toBe(true);
    expect(planoTemBusca("ativa", "pro")).toBe(true);
    expect(planoTemBusca("ativa", "fundador")).toBe(true);
    expect(planoTemBusca("ativa", "start")).toBe(false);
    expect(planoTemBusca("cancelada", "pro")).toBe(false);
    expect(planoTemBusca(null, null)).toBe(false);
  });

  it("mostra o convite do Pro no lugar da busca, só para quem gerencia", () => {
    expect(estadoBanner({ ...base, temPlano: false })).toBe("semPlano");
    expect(estadoBanner({ ...base, temPlano: false, aceitou: true })).toBe("semPlano");
    expect(estadoBanner({ ...base, temPlano: false, podeGerenciar: false })).toBeNull();
  });
});
