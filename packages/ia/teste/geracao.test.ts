import { describe, expect, it, vi } from "vitest";
import type { ClienteIa } from "../src/cliente.js";
import { gerarPeca, montarPedidoGeracao, type EntradaGeracao } from "../src/geracao/gerar-peca.js";
import { acharPendencias, separarSecoes } from "../src/geracao/secoes.js";
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
  prazo: { vencimento: "2026-11-23", fundamento: "Lei 9.099/1995" },
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
    expect(resultado.versaoPrompt).toBe("geracao@3");
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
