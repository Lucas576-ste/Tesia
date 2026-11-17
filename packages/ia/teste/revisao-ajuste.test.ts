import { describe, expect, it, vi } from "vitest";
import type { ClienteIa } from "../src/cliente.js";
import { ajustarPeca, juntarSecoes, separarSecoesAlteradas } from "../src/geracao/ajuste.js";
import { marcarProblemas } from "../src/geracao/revisao.js";
import { RespostaInvalidaDaIa } from "../src/transcricao.js";

const secoes = [
  { titulo: "", texto: "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ FEDERAL" },
  {
    titulo: "II – DO DIREITO",
    texto:
      "Conforme a Súmula 77 da TNU, o juiz pode afastar o laudo.\n\nO art. 479 do CPC [CONFIRMAR: conferir na fonte oficial] permite isso.",
  },
];

describe("marcarProblemas", () => {
  it("insere a pendência logo depois do trecho, sem duplicar", () => {
    const { secoes: marcadas, inseridos } = marcarProblemas(secoes, [
      { trecho_exato: "Súmula 77 da TNU", motivo: "conferir na fonte oficial" },
      { trecho_exato: "O art. 479 do CPC", motivo: "conferir" },
      { trecho_exato: "trecho que não existe no texto", motivo: "x" },
    ]);
    expect(inseridos).toBe(1);
    expect(marcadas[1]?.texto).toContain(
      "Súmula 77 da TNU [CONFIRMAR: conferir na fonte oficial], o juiz",
    );
    expect(marcadas[1]?.texto.match(/\[CONFIRMAR/g)).toHaveLength(2);
  });

  it("acha o trecho mesmo com espaços diferentes", () => {
    const { inseridos } = marcarProblemas(secoes, [
      { trecho_exato: "Súmula  77 da\nTNU", motivo: "conferir" },
    ]);
    expect(inseridos).toBe(1);
  });
});

const resposta = `<secao indice="1" titulo="II – DO DIREITO">
Texto reforçado sobre os atestados.
</secao>
<secao indice="2" titulo="III – DOS PEDIDOS">
Requer o provimento.
</secao>`;

describe("ajuste", () => {
  it("separa as seções alteradas e junta com as originais", () => {
    const alteradas = separarSecoesAlteradas(resposta);
    expect(alteradas.map((s) => s.indice)).toEqual([1, 2]);
    const juntas = juntarSecoes(secoes, alteradas);
    expect(juntas).toHaveLength(3);
    expect(juntas[0]).toEqual(secoes[0]);
    expect(juntas[1]?.texto).toBe("Texto reforçado sobre os atestados.");
  });

  it("chama o Sonnet com fallback e falha sem seções alteradas", async () => {
    const stream = vi.fn((pedido: Record<string, unknown>) => ({
      finalMessage: async () => ({
        pedido,
        stop_reason: "end_turn",
        content: [{ type: "text", text: String(pedido.model).includes("sonnet") ? resposta : "" }],
        usage: {
          input_tokens: 3000,
          output_tokens: 800,
          cache_read_input_tokens: 0,
          cache_creation_input_tokens: 0,
        },
      }),
    }));
    const cliente = { beta: { messages: { stream } } } as unknown as ClienteIa;
    const resultado = await ajustarPeca(cliente, {
      secoes,
      pedido: "reforce os atestados",
      perfil: null,
    });
    expect(resultado.alteradas).toBe(2);
    expect(stream.mock.calls[0]?.[0]?.fallbacks).toBe("default");
    expect(JSON.stringify(stream.mock.calls[0]?.[0]?.messages)).toContain("reforce os atestados");

    const vazio = {
      beta: {
        messages: {
          stream: () => ({
            finalMessage: async () => ({
              stop_reason: "end_turn",
              content: [{ type: "text", text: "sem tags" }],
              usage: {
                input_tokens: 1,
                output_tokens: 1,
                cache_read_input_tokens: 0,
                cache_creation_input_tokens: 0,
              },
            }),
          }),
        },
      },
    } as unknown as ClienteIa;
    await expect(ajustarPeca(vazio, { secoes, pedido: "x", perfil: null })).rejects.toBeInstanceOf(
      RespostaInvalidaDaIa,
    );
  });
});
