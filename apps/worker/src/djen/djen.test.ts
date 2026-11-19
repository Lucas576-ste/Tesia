import { describe, expect, it } from "vitest";
import { buscarComunicacoes, FormatoDjenMudou } from "./cliente";
import { eDoAdvogado, normalizarOab, type Comunicacao } from "./filtrar";

const base: Comunicacao = {
  id: 1,
  ativo: true,
  status: "P",
  data_disponibilizacao: "2026-11-18",
  data_cancelamento: null,
  texto: "Intimação da sentença.",
  siglaTribunal: "TJDFT",
  nomeOrgao: "1ª Vara",
  numero_processo: "07000000020268070001",
  tipoComunicacao: "Intimação",
  destinatarioadvogados: [{ advogado: { numero_oab: "012345", uf_oab: "df" } }],
};

const resposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

describe("filtro do DJEN", () => {
  it("normaliza a OAB", () => {
    expect(normalizarOab("012.345")).toBe("12345");
  });
  it("aceita só a OAB e a UF do advogado", () => {
    expect(eDoAdvogado(base, "12345", "DF")).toBe(true);
    expect(eDoAdvogado(base, "12345", "GO")).toBe(false);
    expect(eDoAdvogado(base, "54321", "DF")).toBe(false);
  });
  it("ignora cancelada, inativa ou sem texto", () => {
    expect(eDoAdvogado({ ...base, data_cancelamento: "2026-11-19" }, "12345", "DF")).toBe(false);
    expect(eDoAdvogado({ ...base, ativo: false }, "12345", "DF")).toBe(false);
    expect(eDoAdvogado({ ...base, texto: " " }, "12345", "DF")).toBe(false);
  });
});

describe("cliente do DJEN", () => {
  const opcoes = {
    oab: "12345",
    uf: "df",
    de: "2026-11-11",
    ate: "2026-11-18",
    esperar: async () => {},
  };

  it("pagina até a última página", async () => {
    const chamadas: string[] = [];
    const cheia = Array.from({ length: 100 }, (_, i) => ({ ...base, id: i }));
    const buscar = (async (url: string) => {
      chamadas.push(url);
      return resposta({
        count: 101,
        items: chamadas.length === 1 ? cheia : [{ ...base, id: 100 }],
      });
    }) as unknown as typeof fetch;
    const itens = await buscarComunicacoes({ ...opcoes, buscar });
    expect(itens).toHaveLength(101);
    expect(chamadas[0]).toContain("ufOab=DF");
    expect(chamadas[1]).toContain("pagina=2");
  });

  it("espera e tenta de novo no 429", async () => {
    let n = 0;
    const buscar = (async () => {
      n += 1;
      return n === 1 ? resposta({}, 429) : resposta({ count: 1, items: [base] });
    }) as unknown as typeof fetch;
    expect(await buscarComunicacoes({ ...opcoes, buscar })).toHaveLength(1);
  });

  it("avisa quando o formato muda", async () => {
    const buscar = (async () => resposta({ resultado: [] })) as unknown as typeof fetch;
    await expect(buscarComunicacoes({ ...opcoes, buscar })).rejects.toBeInstanceOf(
      FormatoDjenMudou,
    );
  });
});
