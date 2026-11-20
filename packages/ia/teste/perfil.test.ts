import { describe, expect, it, vi } from "vitest";
import type { ClienteIa } from "../src/cliente.js";
import { gerarPerfilEstilo, type PerfilEstilo } from "../src/estilo/perfil.js";
import { RespostaInvalidaDaIa } from "../src/transcricao.js";

const perfil: PerfilEstilo = {
  aprendizados: [{ parte: "abertura", itens: ["Você abre pedindo a palavra.", "  "] }],
  estrutura_por_tipo: [{ tipo: "Contestação", secoes: ["DOS FATOS", "DO DIREITO", "DOS PEDIDOS"] }],
  tom: "Direto e técnico",
  tamanho_frases: "curtas",
  citacao_lei: "Cita o artigo antes da lei: art. 373, I, do CPC",
  citacao_jurisprudencia: "Raramente cita jurisprudência",
  referencias_frequentes: ["CPC, art. 373", "CC, art. 206"],
  abertura: "vem, respeitosamente, apresentar",
  fechamento: "Nestes termos, pede deferimento.",
  expressoes_tipicas: ["Diante do exposto"],
  frases_exibicao: ["Um.", "Dois.", "Três.", "Quatro.", "Cinco.", "Seis.", "Sete."],
};

function clienteFalso(saida: unknown, stopReason = "end_turn") {
  const parse = vi.fn(async (pedido: Record<string, unknown>) => ({
    pedido,
    stop_reason: stopReason,
    parsed_output: saida,
    usage: {
      input_tokens: 10_000,
      output_tokens: 800,
      cache_read_input_tokens: 0,
      cache_creation_input_tokens: 0,
    },
  }));
  return { cliente: { beta: { messages: { parse } } } as unknown as ClienteIa, parse };
}

const pecas = [
  { nome: "contestacao.docx", texto: "Texto da contestação" },
  { nome: "recurso.pdf", texto: "Texto do recurso" },
];

describe("gerarPerfilEstilo", () => {
  it("envia as peças ao Sonnet com fallback e limita as frases a 6", async () => {
    const { cliente, parse } = clienteFalso(perfil);
    const resultado = await gerarPerfilEstilo(cliente, pecas);
    const pedido = parse.mock.calls[0]?.[0];
    expect(pedido?.model).toBe("claude-sonnet-5-5");
    expect(pedido?.fallbacks).toBe("default");
    expect(JSON.stringify(pedido?.messages)).toContain('arquivo=\\"recurso.pdf\\"');
    expect(resultado.perfil.frases_exibicao).toHaveLength(6);
    expect(resultado.versaoPrompt).toBe("perfil@2");
    expect(resultado.uso.custoEstimado).toBeCloseTo(0.028, 6);
  });

  it("recusa, corte e poucas frases viram erro", async () => {
    for (const [saida, motivo] of [
      [perfil, "refusal"],
      [perfil, "max_tokens"],
      [{ ...perfil, frases_exibicao: ["Só uma."] }, "end_turn"],
    ] as const) {
      const { cliente } = clienteFalso(saida, motivo);
      await expect(gerarPerfilEstilo(cliente, pecas)).rejects.toBeInstanceOf(RespostaInvalidaDaIa);
    }
  });

  it("sem peças, não chama a API", async () => {
    const { cliente, parse } = clienteFalso(perfil);
    await expect(gerarPerfilEstilo(cliente, [])).rejects.toThrow("Nenhuma peça");
    expect(parse).not.toHaveBeenCalled();
  });
});
