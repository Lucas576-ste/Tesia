import { describe, expect, it } from "vitest";
import {
  contarFiltrosAtivos,
  filtrosIntimacoesDaUrl,
  linhaDaIntimacao,
  urlDasIntimacoes,
  type LinhaRpc,
} from "@/lib/intimacoes-lista";

const base: LinhaRpc = {
  id: "00000000-0000-4000-8000-000000000001",
  status: "analisada",
  origem: "djen",
  criado_em: "2026-11-24T12:00:00Z",
  publicada_em: "2026-11-23",
  tratamento: "pendente",
  concluida_em: null,
  numero_processo: "07234567820268070001",
  processo_id: null,
  tribunal: "TJDFT",
  uf: "DF",
  tipo_publicacao: "Sentença",
  termo_id: null,
  termo_nome: "OAB 12345/DF",
  responsavel_id: null,
  responsavel_nome: null,
  dados: {
    numero_processo: null,
    tribunal: "TJDFT",
    orgao: "1ª Vara Cível",
    uf: "DF",
    municipio: "Brasília",
    partes: [
      { nome: "Banco Alfa", polo: "ativo" },
      { nome: "Maria", polo: "passivo" },
    ],
    polo_cliente: "passivo",
    area: "civel",
    rito: "comum",
    tipo_ato: "sentenca",
    forma_intimacao: "diario",
    data_disponibilizacao: "2026-11-23",
    data_envio_portal: null,
    resultado: null,
    pontos: [],
  },
  pecas: [{ codigo: "contestacao", nome: "Contestação", justificativa: "x", recomendada: true }],
  prazo_confirmado: false,
  total: 1,
};

describe("filtrosIntimacoesDaUrl", () => {
  it("lê filtros válidos e ignora os inválidos", () => {
    const filtros = filtrosIntimacoesDaUrl({
      busca: " banco ",
      uf: "DF",
      de: "2026-11-01",
      ate: "data-ruim",
      status: "pendente",
      termo: "nao-e-uuid",
      pagina: "3",
    });
    expect(filtros).toMatchObject({
      busca: "banco",
      uf: "DF",
      de: "2026-11-01",
      status: "pendente",
      pagina: 3,
    });
    expect(filtros.ate).toBeUndefined();
    expect(filtros.termo).toBeUndefined();
  });

  it("aceita o atalho antigo ?filtro=aguardando", () => {
    expect(filtrosIntimacoesDaUrl({ filtro: "aguardando" }).aguardando).toBe(true);
    expect(filtrosIntimacoesDaUrl({}).aguardando).toBe(false);
  });

  it("monta a URL só com o que foi escolhido e volta para a página 1 ao mudar", () => {
    const filtros = filtrosIntimacoesDaUrl({ uf: "SP", pagina: "4" });
    expect(urlDasIntimacoes(filtros)).toBe("/app/intimacoes?uf=SP&pagina=4");
    expect(urlDasIntimacoes(filtros, { uf: undefined, pagina: 1 })).toBe("/app/intimacoes");
  });

  it("conta os filtros ativos sem contar a busca nem a página", () => {
    expect(
      contarFiltrosAtivos(
        filtrosIntimacoesDaUrl({ uf: "DF", tipo: "Sentença", busca: "x", pagina: "2" }),
      ),
    ).toBe(2);
  });
});

describe("linhaDaIntimacao", () => {
  it("monta partes, CNJ, peça e data a partir do que veio do banco", () => {
    const linha = linhaDaIntimacao(base);
    expect(linha.partes).toContain("Banco Alfa");
    expect(linha.cnj).toBe("0723456-78.2026.8.07.0001");
    expect(linha.peca).toBe("Contestação");
    expect(linha.data).toBe("23/11/2026");
    expect(linha.djen).toBe(true);
    expect(linha.situacao).toBe("aguardando");
  });

  it("deriva a situação do status, do prazo e do tratamento", () => {
    expect(linhaDaIntimacao({ ...base, status: "recebida" }).situacao).toBe("fila");
    expect(linhaDaIntimacao({ ...base, status: "processando" }).situacao).toBe("lendo");
    expect(linhaDaIntimacao({ ...base, status: "erro" }).situacao).toBe("erro");
    expect(linhaDaIntimacao({ ...base, prazo_confirmado: true }).situacao).toBe("confirmado");
    expect(linhaDaIntimacao({ ...base, tratamento: "concluida" }).situacao).toBe("concluida");
    expect(linhaDaIntimacao({ ...base, tratamento: "ignorada" }).situacao).toBe("ignorada");
  });

  it("aguenta intimação ainda sem análise", () => {
    const linha = linhaDaIntimacao({
      ...base,
      status: "recebida",
      dados: null,
      pecas: null,
      numero_processo: null,
    });
    expect(linha.partes).toBe("Ainda não identificadas");
    expect(linha.cnj).toBeNull();
    expect(linha.peca).toBeNull();
  });
});
