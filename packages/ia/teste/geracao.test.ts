import { describe, expect, it, vi } from "vitest";
import type { ClienteIa } from "../src/cliente.js";
import { gerarPeca, montarPedidoGeracao, type EntradaGeracao } from "../src/geracao/gerar-peca.js";
import { clienteFalso as clienteFalsoDeEtapa } from "./cliente-falso.js";
import { pontosSemPrazo } from "../src/geracao/pontos.js";
import { marcarMencaoDePrazo } from "../src/geracao/revisao.js";
import { acharPendencias, separarSecoes } from "../src/geracao/secoes.js";
import { INSTRUCOES_GERACAO } from "../src/prompts/geracao.js";
import { INSTRUCOES_REVISAO, VERSAO_REVISAO } from "../src/prompts/revisao.js";
import { RespostaInvalidaDaIa } from "../src/transcricao.js";

const resposta = `<secao titulo="">
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ FEDERAL DA 25ª VARA.
</secao>
<secao titulo="I – DOS FATOS">
O recorrente teve o benefício negado. A perícia ocorreu em [CONFIRMAR: data da perícia].
</secao>
<secao titulo="II – DO DIREITO">
O juiz não está adstrito ao laudo (art. 479 do CPC). Súmula 77 da TNU [CONFIRMAR: conferir na fonte oficial].
</secao>
<secao titulo="vazia">   </secao>`;

const entrada: EntradaGeracao = {
  peca: {
    nome: "Recurso inominado",
    estrutura: ["peticao_interposicao", "razoes", "pedidos"],
    instrucoes: null,
  },
  perfil: null,
  trechos: [
    { documento: "recurso.pdf", secao: "fundamentos", texto: "O juiz não está adstrito ao laudo." },
  ],
  dados: { numero_processo: "1000123-45.2026.4.01.3400" },
  textoIntimacao: "SENTENÇA. Julgo improcedente.",
  pontosAtacar: [
    { titulo: "Atestado ignorado", explicacao: "A sentença não analisou o atestado." },
  ],
};

function clienteFalso(texto: string, stopReason = "end_turn") {
  const stream = vi.fn((pedido: Record<string, unknown>) => ({
    finalMessage: async () => ({
      pedido,
      stop_reason: stopReason,
      content: [{ type: "text", text: texto }],
      usage: {
        input_tokens: 8000,
        output_tokens: 2500,
        cache_read_input_tokens: 0,
        cache_creation_input_tokens: 3000,
      },
    }),
  }));
  return { cliente: { beta: { messages: { stream } } } as unknown as ClienteIa, stream };
}

describe("separarSecoes e acharPendencias", () => {
  it("separa as seções na ordem e descarta as vazias", () => {
    const secoes = separarSecoes(resposta);
    expect(secoes.map((s) => s.titulo)).toEqual(["", "I – DOS FATOS", "II – DO DIREITO"]);
  });

  it("acha cada [CONFIRMAR] com a seção", () => {
    expect(acharPendencias(separarSecoes(resposta))).toEqual([
      { secao: 1, titulo: "I – DOS FATOS", texto: "data da perícia" },
      { secao: 2, titulo: "II – DO DIREITO", texto: "conferir na fonte oficial" },
    ]);
  });
});

describe("montarPedidoGeracao", () => {
  it("envia nome e OAB do advogado e não envia prazo", () => {
    const { conteudo } = montarPedidoGeracao({
      ...entrada,
      advogado: { nome: "Helena Martins Prado", oab: "OAB/DF 00.000" },
    });
    expect(conteudo).toContain(
      "<advogado>\nNome: Helena Martins Prado\nOAB: OAB/DF 00.000\n</advogado>",
    );
    expect(conteudo).not.toMatch(/prazo/i);
    expect(montarPedidoGeracao(entrada).conteudo).not.toContain("<advogado>");
  });

  it("inclui a qualificação do cliente só quando ela existe", () => {
    expect(montarPedidoGeracao(entrada).conteudo).not.toContain("<qualificacao_cliente>");
    const { conteudo } = montarPedidoGeracao({
      ...entrada,
      qualificacaoCliente: "MARIA DA SILVA, brasileira",
    });
    expect(conteudo).toContain(
      "<qualificacao_cliente>\nMARIA DA SILVA, brasileira\n</qualificacao_cliente>",
    );
  });

  it("envia o tamanho de referência só quando ele existe", () => {
    expect(montarPedidoGeracao(entrada).conteudo).not.toContain("<tamanho_de_referencia>");
    expect(montarPedidoGeracao({ ...entrada, tamanhoReferencia: null }).conteudo).not.toContain(
      "<tamanho_de_referencia>",
    );
    const { conteudo } = montarPedidoGeracao({ ...entrada, tamanhoReferencia: 1750 });
    expect(conteudo).toContain(
      "<tamanho_de_referencia>\n1750 caracteres\n</tamanho_de_referencia>",
    );
    expect(conteudo).not.toMatch(/prazo/i);
  });

  it("põe instruções, perfil e tipo de peça em 3 blocos com cache, nesta ordem", () => {
    const { sistema, conteudo } = montarPedidoGeracao(entrada);
    expect(sistema).toHaveLength(3);
    expect(sistema.every((bloco) => bloco.cache_control.type === "ephemeral")).toBe(true);
    expect(sistema[0]?.text).toContain("rascunho de peça processual");
    expect(sistema[1]?.text).toContain("Perfil de estilo");
    expect(sistema[2]?.text).toContain("Recurso inominado");
    expect(conteudo).toContain('peca="recurso.pdf"');
    expect(conteudo).toContain("Atestado ignorado");
  });
});

describe("gerarPeca", () => {
  it("usa o Sonnet com fallback e devolve seções, pendências e custo", async () => {
    const { cliente, stream } = clienteFalso(resposta);
    const resultado = await gerarPeca(cliente, entrada);
    const pedido = stream.mock.calls[0]?.[0];
    expect(pedido?.model).toBe("claude-sonnet-5-5");
    expect(pedido?.fallbacks).toBe("default");
    expect(resultado.secoes).toHaveLength(3);
    expect(resultado.pendencias).toHaveLength(2);
    expect(resultado.versaoPrompt).toBe("geracao@6");
    expect(resultado.uso.custoEstimado).toBeCloseTo(0.0485, 6);
  });

  it("recusa, corte e resposta fora do formato viram erro", async () => {
    for (const [texto, motivo] of [
      [resposta, "refusal"],
      [resposta, "max_tokens"],
      ["texto solto sem seções", "end_turn"],
    ] as const) {
      const { cliente } = clienteFalso(texto, motivo);
      await expect(gerarPeca(cliente, entrada)).rejects.toBeInstanceOf(RespostaInvalidaDaIa);
    }
  });
});

describe("marcarMencaoDePrazo", () => {
  const secoes = [
    {
      titulo: "II – DO DIREITO",
      texto:
        "Com a devida vênia, a ação não procede.\n\nQuanto à tempestividade, a contestação é apresentada dentro do prazo legal.",
    },
  ];

  it("marca só o parágrafo que trata de prazo", () => {
    const { secoes: marcadas, inseridos } = marcarMencaoDePrazo(secoes, [
      "Em síntese, o autor alega.",
    ]);
    expect(inseridos).toBe(1);
    expect(marcadas[0]?.texto.split("\n\n")[0]).not.toContain("[CONFIRMAR");
    expect(marcadas[0]?.texto).toContain(
      "dentro do prazo legal. [CONFIRMAR: o prazo é controlado pelo sistema",
    );
  });

  it("pega o parágrafo sobre início do prazo, mas não o prazo prescricional", () => {
    const { inseridos } = marcarMencaoDePrazo(
      [
        {
          titulo: "II – DO DIREITO",
          texto:
            "O prazo para contestar tem início com a juntada aos autos do comprovante de citação.\n\nO prazo prescricional é de 5 anos.\n\nO prazo de 5 anos já se esgotou.",
        },
      ],
      [],
    );
    expect(inseridos).toBe(1);
  });

  it("não marca de novo e não age se o advogado já fala de prazo nas peças dele", () => {
    const uma = marcarMencaoDePrazo(secoes, []);
    expect(marcarMencaoDePrazo(uma.secoes, []).inseridos).toBe(0);
    expect(marcarMencaoDePrazo(secoes, ["A contestação é tempestiva."]).inseridos).toBe(0);
  });
});

describe("revisarCitacoes", () => {
  it("manda nome, OAB e qualificação como fontes válidas", async () => {
    const { revisarCitacoes } = await import("../src/geracao/revisao.js");
    const { cliente, parse } = clienteFalsoDeEtapa({ problemas: [] });
    await revisarCitacoes(cliente, {
      secoes: [{ titulo: "", texto: "texto" }],
      textoIntimacao: "intimação",
      trechos: [],
      advogado: { nome: "Helena", oab: "OAB/DF nº 1" },
      qualificacaoCliente: "MARIA, brasileira",
    });
    const pedido = JSON.stringify(parse.mock.calls[0]);
    expect(pedido).toContain(
      "<dados_do_advogado>\\nNome: Helena\\nOAB: OAB/DF nº 1\\n</dados_do_advogado>",
    );
    expect(pedido).toContain(
      "<qualificacao_cliente>\\nMARIA, brasileira\\n</qualificacao_cliente>",
    );
  });
});

describe("pontosSemPrazo", () => {
  it("tira o ponto que é só sobre prazo e mantém os de mérito", () => {
    const pontos = [
      { titulo: "Prazo conta da juntada do comprovante" },
      { titulo: "Valor sem discriminação de multa e juros" },
      { titulo: "Prescrição quinquenal" },
      { titulo: "Prazo prescricional de 5 anos" },
      { titulo: "Tempestividade da contestação" },
    ];
    expect(pontosSemPrazo(pontos).map((p) => p.titulo)).toEqual([
      "Valor sem discriminação de multa e juros",
      "Prescrição quinquenal",
      "Prazo prescricional de 5 anos",
    ]);
  });
});

describe("instruções de geração e revisão", () => {
  it("manda o modelo seguir só a forma dos trechos e não afirmar o que a inicial contém", () => {
    expect(INSTRUCOES_GERACAO).toContain(
      "Nunca reaproveite deles argumento, fato, nome, número ou valor",
    );
    expect(INSTRUCOES_GERACAO).toContain("não afirme o que a inicial contém ou deixa de conter");
    expect(INSTRUCOES_GERACAO).toContain(
      "no máximo uma marca [CONFIRMAR: conferir na inicial] por seção",
    );
  });

  it("explica como usar o tamanho de referência", () => {
    expect(INSTRUCOES_GERACAO).toContain("<tamanho_de_referencia>");
    expect(INSTRUCOES_GERACAO).toContain("entre 0,8 e 1,1 vez esse número de caracteres");
  });

  it("limita e agrupa os apontamentos da revisão", () => {
    expect(VERSAO_REVISAO).toBe("revisao@4");
    expect(INSTRUCOES_REVISAO).toContain("No máximo 5 apontamentos");
    expect(INSTRUCOES_REVISAO).toContain("devolva um só");
    expect(INSTRUCOES_REVISAO).toContain("Não aponte o que o documento do caso sustenta");
    expect(INSTRUCOES_REVISAO).toContain("fórmulas de estilo do advogado não são problema");
  });
});
