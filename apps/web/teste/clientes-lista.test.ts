import { describe, expect, it } from "vitest";
import {
  contarFiltrosExtras,
  filtrosDaUrl,
  SEM_FILTROS_EXTRAS,
  urlDaLista,
} from "@/lib/clientes-lista";

describe("filtrosDaUrl", () => {
  it("usa os padrões quando a URL está vazia", () => {
    expect(filtrosDaUrl({})).toEqual({
      busca: "",
      papel: undefined,
      origem: undefined,
      processo: undefined,
      uf: undefined,
      cidade: undefined,
      de: undefined,
      ate: undefined,
      aniversario: undefined,
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
        processo: "sem",
        uf: " sp ",
        cidade: " Santos ",
        de: "2026-01-01",
        ate: "2026-03-31",
        aniversario: "mes",
      }),
    ).toEqual({
      busca: "#vip",
      papel: "testemunha",
      origem: "google",
      processo: "sem",
      uf: "SP",
      cidade: "Santos",
      de: "2026-01-01",
      ate: "2026-03-31",
      aniversario: "mes",
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
      processo: "talvez",
      uf: "SAO",
      de: "ontem",
      ate: "2026-13-40",
      aniversario: "ano",
    });
    expect(filtros).toMatchObject({
      processo: undefined,
      uf: undefined,
      de: undefined,
      ate: undefined,
      aniversario: undefined,
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

describe("filtros extras", () => {
  it("leva os filtros novos para a URL e volta igual", () => {
    const filtros = filtrosDaUrl({
      processo: "com",
      uf: "DF",
      cidade: "Brasília",
      de: "2026-02-01",
      ate: "2026-02-28",
      aniversario: "hoje",
    });
    const url = urlDaLista(filtros);
    const parametros = Object.fromEntries(new URL(url, "http://x").searchParams);
    expect(filtrosDaUrl(parametros)).toEqual(filtros);
  });

  it("conta só os filtros extras ativos", () => {
    expect(contarFiltrosExtras(filtrosDaUrl({}))).toBe(0);
    expect(contarFiltrosExtras(filtrosDaUrl({ uf: "DF", aniversario: "mes", busca: "x" }))).toBe(2);
  });

  it("limpar os extras preserva busca, papel e ordem", () => {
    const filtros = filtrosDaUrl({ busca: "ana", papel: "cliente", ordem: "cidade", uf: "DF" });
    const url = urlDaLista(filtros, { ...SEM_FILTROS_EXTRAS, pagina: 1 });
    expect(url).toBe("/app/clientes?busca=ana&papel=cliente&ordem=cidade");
  });

  it("volta para a primeira página ao trocar de filtro", () => {
    const filtros = filtrosDaUrl({ pagina: "4", uf: "DF" });
    expect(urlDaLista(filtros, { uf: "SP", pagina: 1 })).toBe("/app/clientes?uf=SP");
  });
});
