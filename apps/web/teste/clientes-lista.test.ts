import { describe, expect, it } from "vitest";
import { filtrosDaUrl, urlDaLista } from "@/lib/clientes-lista";

describe("filtrosDaUrl", () => {
  it("usa os padrões quando a URL está vazia", () => {
    expect(filtrosDaUrl({})).toEqual({
      busca: "",
      papel: undefined,
      origem: undefined,
      excluidos: false,
      ordem: "nome",
      direcao: "asc",
      pagina: 1,
    });
  });

  it("lê os filtros válidos", () => {
    expect(
      filtrosDaUrl({
        busca: "  #vip ",
        papel: "testemunha",
        origem: "google",
        excluidos: "1",
        ordem: "cadastro",
        direcao: "desc",
        pagina: "3",
      }),
    ).toEqual({
      busca: "#vip",
      papel: "testemunha",
      origem: "google",
      excluidos: true,
      ordem: "cadastro",
      direcao: "desc",
      pagina: 3,
    });
  });

  it("ignora valores inválidos em vez de quebrar", () => {
    const filtros = filtrosDaUrl({
      papel: "chefe",
      origem: "x",
      excluidos: "sim",
      ordem: "preco",
      direcao: "up",
      pagina: "-4",
    });
    expect(filtros).toMatchObject({
      papel: undefined,
      origem: undefined,
      excluidos: false,
      ordem: "nome",
      direcao: "asc",
      pagina: 1,
    });
  });
});

describe("urlDaLista", () => {
  it("omite os valores padrão", () => {
    expect(urlDaLista(filtrosDaUrl({}))).toBe("/app/clientes");
  });

  it("monta a URL com os filtros e volta para a página 1 quando se muda a busca", () => {
    const filtros = filtrosDaUrl({
      papel: "testemunha",
      ordem: "cadastro",
      direcao: "desc",
      pagina: "4",
    });
    expect(urlDaLista(filtros)).toBe(
      "/app/clientes?papel=testemunha&ordem=cadastro&direcao=desc&pagina=4",
    );
    expect(urlDaLista(filtros, { busca: "#vip", pagina: 1 })).toBe(
      "/app/clientes?busca=%23vip&papel=testemunha&ordem=cadastro&direcao=desc",
    );
    expect(urlDaLista(filtros, { excluidos: true, pagina: 1 })).toContain("excluidos=1");
  });
});
