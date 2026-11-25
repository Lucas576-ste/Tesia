import { describe, expect, it } from "vitest";
import type { Comunicacao } from "../djen/filtrar";
import { gravarPublicacao } from "./gravar";
import { hashPublicacao, ufDoTribunal } from "./hash";
import { ProvedorDjen } from "./djen";
import { sincronizarTermos } from "./sincronizar";
import { provedorPje } from "./stubs";
import {
  FalhaAutenticacao,
  type ProvedorPublicacoes,
  type PublicacaoExterna,
  type Termo,
} from "./tipos";

const termo: Termo = {
  id: "00000000-0000-4000-8000-000000000001",
  escritorio_id: "00000000-0000-4000-8000-000000000002",
  responsavel_id: "00000000-0000-4000-8000-000000000003",
  tipo: "advogado",
  oab_numero: "12345",
  oab_uf: "DF",
  documento: null,
  nome: null,
  ufs: [],
};

const publicacao: PublicacaoExterna = {
  idExterno: 10,
  fonte: "diario",
  tribunal: "TJDFT",
  uf: "DF",
  tipoPublicacao: "Sentença",
  classificacao: "intimacao",
  numeroProcesso: "07234567820268070001",
  texto: "Fica intimado da sentença.",
  publicadaEm: "2026-11-23",
  hash: "hash-a",
};

type Chamada = { sql: string; valores: unknown[] };

function bancoFalso(respostas: { [trecho: string]: unknown[] } = {}) {
  const chamadas: Chamada[] = [];
  const db = {
    query: async (sql: string, valores: unknown[] = []) => {
      chamadas.push({ sql, valores });
      const trecho = Object.keys(respostas).find((chave) => sql.includes(chave));
      const rows = trecho ? respostas[trecho]! : [];
      return { rows, rowCount: rows.length };
    },
  };
  return { db: db as never, chamadas };
}

const com = (chamadas: Chamada[], trecho: string) =>
  chamadas.filter(({ sql }) => sql.includes(trecho));

describe("hash e UF", () => {
  it("dá o mesmo hash para o mesmo conteúdo, com ou sem HTML", () => {
    const base = { tribunal: "STJ", numeroProcesso: "1", publicadaEm: "2026-11-13" };
    expect(hashPublicacao({ ...base, texto: "<p>Processo   distribuído</p>" })).toBe(
      hashPublicacao({ ...base, texto: "Processo distribuído" }),
    );
    expect(hashPublicacao({ ...base, texto: "A" })).not.toBe(
      hashPublicacao({ ...base, texto: "B" }),
    );
  });
  it("tira a UF do tribunal de justiça", () => {
    expect(ufDoTribunal("TJDFT")).toBe("DF");
    expect(ufDoTribunal("TJSP")).toBe("SP");
    expect(ufDoTribunal("STJ")).toBeNull();
  });
});

describe("provedor do DJEN", () => {
  const item = (dados: Partial<Comunicacao>): Comunicacao => ({
    id: 1,
    ativo: true,
    data_disponibilizacao: "2026-11-13",
    data_cancelamento: null,
    texto: "Intimem-se.",
    siglaTribunal: "TJSP",
    numero_processo: "07234567820268070001",
    tipoComunicacao: "Intimação",
    tipoDocumento: "Decisão",
    destinatarioadvogados: [{ advogado: { numero_oab: "012345", uf_oab: "DF" } }],
    ...dados,
  });
  const buscarCom = (itens: Comunicacao[]) =>
    (async () =>
      new Response(JSON.stringify({ count: itens.length, items: itens }), {
        headers: { "Content-Type": "application/json" },
      })) as unknown as typeof fetch;

  it("separa ata de distribuição como andamento, mesmo vinda como intimação", async () => {
    const provedor = new ProvedorDjen({
      buscar: buscarCom([
        item({ id: 1 }),
        item({
          id: 2,
          tipoDocumento: "ATA DE DISTRIBUIÇÃO",
          texto: "<p>Processo distribuído pelo sistema automático em 12/11/2026.</p>",
        }),
      ]),
    });
    const resultado = await provedor.buscar(termo, "2026-11-10", "2026-11-13");
    expect(resultado.map((p) => p.classificacao)).toEqual(["intimacao", "andamento"]);
    expect(resultado[1]!.texto).toBe("Processo distribuído pelo sistema automático em 12/11/2026.");
    expect(resultado[0]!.numeroProcesso).toBe("07234567820268070001");
  });

  it("respeita as UFs escolhidas, mantendo tribunais sem UF", async () => {
    const itens = [
      item({ id: 1, siglaTribunal: "TJSP", texto: "a" }),
      item({ id: 2, siglaTribunal: "TJDFT", texto: "b" }),
      item({ id: 3, siglaTribunal: "STJ", texto: "c" }),
    ];
    const provedor = new ProvedorDjen({ buscar: buscarCom(itens) });
    const resultado = await provedor.buscar({ ...termo, ufs: ["DF"] }, "2026-11-10", "2026-11-13");
    expect(resultado.map((p) => p.tribunal)).toEqual(["TJDFT", "STJ"]);
  });

  it("busca termo de pessoa pelo nome da parte", async () => {
    let url = "";
    const buscar = (async (endereco: string) => {
      url = endereco;
      return new Response(JSON.stringify({ count: 0, items: [] }));
    }) as unknown as typeof fetch;
    await new ProvedorDjen({ buscar }).buscar(
      {
        ...termo,
        tipo: "pf",
        oab_numero: null,
        oab_uf: null,
        documento: "52998224725",
        nome: "Maria da Silva",
      },
      "2026-11-10",
      "2026-11-13",
    );
    expect(url).toContain("nomeParte=Maria+da+Silva");
    expect(url).not.toContain("numeroOab");
  });
});

describe("gravarPublicacao", () => {
  it("grava a intimação nova com tarefa e notificação para o responsável", async () => {
    const { db, chamadas } = bancoFalso({
      "from processos": [{ id: "proc-1" }],
      "insert into intimacoes": [{ id: "int-1" }],
      "insert into prazos": [{ id: "tarefa-1" }],
    });
    expect(await gravarPublicacao(db, termo, publicacao, "2026-11-24")).toBe("intimacao");
    const insercao = com(chamadas, "insert into intimacoes")[0]!;
    expect(insercao.valores[1]).toBe("proc-1");
    expect(insercao.valores).toContain("hash-a");
    const tarefa = com(chamadas, "insert into prazos")[0]!;
    expect(tarefa.valores[3]).toBe("Intimação Judicial · 0723456-78.2026.8.07.0001");
    expect(com(chamadas, "insert into notificacoes")[0]!.valores[1]).toBe(termo.responsavel_id);
  });

  it("não cria tarefa nem notificação quando a publicação já existe", async () => {
    const { db, chamadas } = bancoFalso({ "from processos": [{ id: "proc-1" }] });
    expect(await gravarPublicacao(db, termo, publicacao, "2026-11-24")).toBe("repetida");
    expect(com(chamadas, "insert into prazos")).toHaveLength(0);
    expect(com(chamadas, "insert into notificacoes")).toHaveLength(0);
  });

  it("manda andamento para o histórico, sem criar intimação nem tarefa", async () => {
    const { db, chamadas } = bancoFalso({ "insert into andamentos_processo": [{}] });
    const resultado = await gravarPublicacao(
      db,
      termo,
      { ...publicacao, classificacao: "andamento" },
      "2026-11-24",
    );
    expect(resultado).toBe("andamento");
    expect(com(chamadas, "insert into intimacoes")).toHaveLength(0);
    expect(com(chamadas, "insert into prazos")).toHaveLength(0);
  });

  it("deixa o processo em branco quando o CNJ ainda não está cadastrado", async () => {
    const { db, chamadas } = bancoFalso({ "insert into intimacoes": [{ id: "int-2" }] });
    await gravarPublicacao(db, termo, publicacao, "2026-11-24");
    expect(com(chamadas, "insert into intimacoes")[0]!.valores[1]).toBeNull();
  });
});

describe("sincronizarTermos", () => {
  const linhaTermo = { ...termo, inicio: "2026-11-17" };
  const configuracao = (provedor: ProvedorPublicacoes) => {
    const erros: unknown[] = [];
    return {
      erros,
      config: {
        registrar: () => {},
        avisarErro: (erro: unknown) => erros.push(erro),
        provedorDoTermo: () => provedor,
      },
    };
  };

  it("marca o termo como monitorando depois de buscar", async () => {
    const { db, chamadas } = bancoFalso({ "from termos_monitorados t": [linhaTermo] });
    const { config } = configuracao({ buscar: async () => [] });
    await sincronizarTermos(db, config, "2026-11-24");
    const atualizacao = com(chamadas, "set status = 'monitorando'")[0]!;
    expect(atualizacao.valores).toEqual([termo.id, "2026-11-24"]);
  });

  it("conta intimações e andamentos novos", async () => {
    const { db } = bancoFalso({
      "from termos_monitorados t": [linhaTermo],
      "insert into intimacoes": [{ id: "i" }],
      "insert into andamentos_processo": [{}],
    });
    const { config } = configuracao({
      buscar: async () => [
        publicacao,
        { ...publicacao, classificacao: "andamento", hash: "hash-b" },
      ],
    });
    expect(await sincronizarTermos(db, config, "2026-11-24")).toEqual({
      intimacoes: 1,
      andamentos: 1,
    });
  });

  it("falha de autenticação muda o status e avisa o responsável", async () => {
    const { db, chamadas } = bancoFalso({
      "from termos_monitorados t": [linhaTermo],
      "coalesce($2::uuid": [{ id: termo.responsavel_id }],
    });
    const { config, erros } = configuracao({
      buscar: async () => {
        throw new FalhaAutenticacao("Senha recusada pelo tribunal");
      },
    });
    await sincronizarTermos(db, config, "2026-11-24");
    expect(com(chamadas, "'falha_autenticacao'")).toHaveLength(1);
    const aviso = com(chamadas, "insert into notificacoes")[0]!;
    expect(aviso.valores[2]).toContain("Senha recusada pelo tribunal");
    expect(com(chamadas, "set status = 'monitorando'")).toHaveLength(0);
    expect(erros).toHaveLength(0);
  });

  it("erro comum guarda a mensagem sem trocar o status", async () => {
    const { db, chamadas } = bancoFalso({ "from termos_monitorados t": [linhaTermo] });
    const { config, erros } = configuracao({
      buscar: async () => {
        throw new Error("DJEN respondeu 500");
      },
    });
    await sincronizarTermos(db, config, "2026-11-24");
    expect(com(chamadas, "set ultimo_erro")[0]!.valores).toEqual([termo.id, "DJEN respondeu 500"]);
    expect(com(chamadas, "'falha_autenticacao'")).toHaveLength(0);
    expect(erros).toHaveLength(1);
  });

  it("provedor ainda não integrado registra o motivo", async () => {
    const { db, chamadas } = bancoFalso({ "from termos_monitorados t": [linhaTermo] });
    const { config } = configuracao(provedorPje);
    await sincronizarTermos(db, config, "2026-11-24");
    expect(String(com(chamadas, "set ultimo_erro")[0]!.valores[1])).toContain("PJe");
  });
});
