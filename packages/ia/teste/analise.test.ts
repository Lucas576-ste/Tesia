import { describe, expect, it } from "vitest";
import { escolherPeca, schemaEscolha } from "../src/analise/escolha-peca.js";
import { extrairDados, type Extracao } from "../src/analise/extracao.js";
import { limitarFrases, resumirIntimacao } from "../src/analise/resumo.js";
import { trechoNoDocumento } from "../src/analise/trechos.js";
import { VERSAO_EXTRACAO } from "../src/prompts/extracao.js";
import { RespostaInvalidaDaIa } from "../src/transcricao.js";
import { clienteFalso } from "./cliente-falso.js";

const documento = `PODER JUDICIÁRIO. Processo 1000123-45.2026.4.01.3400.
SENTENÇA. Julgo IMPROCEDENTE o pedido, pois o laudo pericial concluiu pela   capacidade laboral.
Não foi analisado o atestado do médico assistente juntado no ID 123.`;

const extracao: Extracao = {
  numero_processo: "1000123-45.2026.4.01.3400",
  tribunal: "TRF1",
  orgao: null,
  uf: "df",
  municipio: null,
  partes: [{ nome: "José", polo: "ativo" }],
  polo_cliente: "ativo",
  area: "previdenciario",
  rito: "jef",
  tipo_ato: "sentenca",
  forma_intimacao: "diario",
  data_disponibilizacao: "2026-11-10",
  data_envio_portal: null,
  resultado: "Pedido julgado improcedente",
  pontos: [
    {
      titulo: "Laudo",
      trecho: "o laudo pericial concluiu pela capacidade laboral",
    },
    { titulo: "Inventado", trecho: "o réu confessou a dívida integralmente" },
  ],
};

describe("trechoNoDocumento", () => {
  it("acha o trecho ignorando espaços e maiúsculas", () => {
    expect(trechoNoDocumento("JULGO improcedente   o pedido", documento)).toBe(true);
  });

  it("recusa trecho que não está no documento ou curto demais", () => {
    expect(trechoNoDocumento("julgo procedente o pedido", documento)).toBe(false);
    expect(trechoNoDocumento("pedido", documento)).toBe(false);
  });
});

describe("extrairDados", () => {
  it("devolve os dados, descarta ponto inventado e calcula o uso", async () => {
    const { cliente, parse } = clienteFalso(extracao);
    const etapa = await extrairDados(cliente, documento);
    expect(etapa.resultado.pontos.map((ponto) => ponto.titulo)).toEqual(["Laudo"]);
    expect(etapa.resultado.uf).toBe("DF");
    expect(etapa.versaoPrompt).toBe(VERSAO_EXTRACAO);
    expect(etapa.uso.modelo).toBe("claude-haiku-5-5");
    expect(etapa.uso.custoEstimado).toBeGreaterThan(0);
    expect(parse).toHaveBeenCalledOnce();
  });

  it("anula data em formato errado ou inexistente", async () => {
    for (const data of ["10/11/2026", "2026-02-30"]) {
      const { cliente } = clienteFalso({ ...extracao, data_disponibilizacao: data });
      const etapa = await extrairDados(cliente, documento);
      expect(etapa.resultado.data_disponibilizacao).toBeNull();
    }
  });

  it("valida também a data de envio do portal", async () => {
    const { cliente } = clienteFalso({
      ...extracao,
      forma_intimacao: "portal",
      data_envio_portal: "05/11/2026",
    });
    const etapa = await extrairDados(cliente, documento);
    expect(etapa.resultado.forma_intimacao).toBe("portal");
    expect(etapa.resultado.data_envio_portal).toBeNull();
  });

  it("falha em recusa, resposta cortada ou formato inválido", async () => {
    for (const [saida, motivo] of [
      [extracao, "refusal"],
      [extracao, "max_tokens"],
      [null, "end_turn"],
    ] as const) {
      const { cliente } = clienteFalso(saida, motivo);
      await expect(extrairDados(cliente, documento)).rejects.toBeInstanceOf(RespostaInvalidaDaIa);
    }
  });
});

describe("resumirIntimacao", () => {
  it("limita a 4 frases e mantém só pontos com trecho real", async () => {
    const { cliente } = clienteFalso({
      o_que_aconteceu: "Um. Dois. Três. Quatro. Cinco.",
      pontos_ataque: [
        {
          titulo: "Atestado ignorado",
          explicacao: "A sentença não analisou o atestado.",
          trecho: "Não foi analisado o atestado do médico assistente",
        },
        { titulo: "Falso", explicacao: "x", trecho: "prescrição reconhecida de ofício" },
      ],
    });
    const etapa = await resumirIntimacao(cliente, documento, extracao);
    expect(etapa.resultado.o_que_aconteceu).toBe("Um. Dois. Três. Quatro.");
    expect(etapa.resultado.pontos_ataque).toHaveLength(1);
  });

  it("limitarFrases não corta em número de processo nem em abreviação", () => {
    const texto =
      "Processo 1023456-78.2026.4.01.3400 contra o Banco Exemplo S.A. (réu) foi julgado. Dois. Três. Quatro. Cinco.";
    expect(limitarFrases(texto)).toBe(
      "Processo 1023456-78.2026.4.01.3400 contra o Banco Exemplo S.A. (réu) foi julgado. Dois. Três. Quatro.",
    );
  });

  it("limitarFrases mantém texto sem ponto final", () => {
    expect(limitarFrases("Sem ponto final")).toBe("Sem ponto final");
  });
});

describe("escolherPeca", () => {
  const opcoes = [
    { codigo: "recurso_inominado", nome: "Recurso inominado", dias: 10 },
    { codigo: "embargos_declaracao", nome: "Embargos de declaração", dias: 5 },
  ];

  it("o schema só aceita códigos recebidos", () => {
    const schema = schemaEscolha(["recurso_inominado", "embargos_declaracao"]);
    const item = { codigo: "apelacao", justificativa: "x" };
    expect(schema.safeParse({ recomendada: item, alternativas: [] }).success).toBe(false);
  });

  it("devolve a escolha sem repetir a recomendada nas alternativas", async () => {
    const recomendada = {
      codigo: "recurso_inominado",
      justificativa: "Cabe contra sentença no JEF.",
    };
    const { cliente } = clienteFalso({
      recomendada,
      alternativas: [
        recomendada,
        { codigo: "embargos_declaracao", justificativa: "Há omissão sobre o atestado." },
      ],
    });
    const etapa = await escolherPeca(cliente, extracao, opcoes);
    expect(etapa.resultado.recomendada.codigo).toBe("recurso_inominado");
    expect(etapa.resultado.alternativas.map((a) => a.codigo)).toEqual(["embargos_declaracao"]);
  });

  it("sem opções, falha antes de chamar a API", async () => {
    const { cliente, parse } = clienteFalso(null);
    await expect(escolherPeca(cliente, extracao, [])).rejects.toThrow("Nenhuma peça");
    expect(parse).not.toHaveBeenCalled();
  });
});
