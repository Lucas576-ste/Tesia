import { describe, expect, it, vi } from "vitest";
import {
  ErroEmbeddingsDefinitivo,
  gerarEmbeddings,
  vetorParaPgvector,
} from "../src/estilo/embeddings.js";
import { classificarTitulo, dividirEmSecoes, ehTitulo } from "../src/estilo/secoes.js";

const peca = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ FEDERAL DO JUIZADO ESPECIAL FEDERAL DE BRASÍLIA
Processo nº 1000123-45.2026.4.01.3400
JOSÉ DA SILVA, brasileiro, aposentado, inscrito no CPF sob o nº 000.000.000-00, vem, respeitosamente, por seu advogado, interpor RECURSO INOMINADO contra a sentença, pelos fatos e fundamentos a seguir.
I – DOS FATOS
O recorrente requereu o auxílio por incapacidade temporária, negado pelo INSS sob o argumento de ausência de incapacidade laboral.
A sentença acolheu integralmente o laudo pericial, sem enfrentar o atestado do médico assistente.
II – DO DIREITO
O juiz não está adstrito ao laudo pericial, podendo formar sua convicção com outros elementos provados nos autos, nos termos do art. 479 do CPC.
III – DOS PEDIDOS
Diante do exposto, requer o provimento do recurso para reformar a sentença e conceder o benefício desde a data do requerimento administrativo.
Nestes termos, pede deferimento.
Brasília, 10 de novembro de 2026.
Fulano Teste – OAB/DF 00.000`;

describe("ehTitulo e classificarTitulo", () => {
  it("reconhece títulos em maiúsculas e numerados", () => {
    expect(ehTitulo("DOS FATOS")).toBe(true);
    expect(ehTitulo("II – Do mérito")).toBe(true);
    expect(ehTitulo("O recorrente requereu o benefício.")).toBe(false);
  });

  it("põe cada título numa seção padrão", () => {
    expect(classificarTitulo("I – DOS FATOS")).toBe("fatos");
    expect(classificarTitulo("DA SÍNTESE DA DEMANDA")).toBe("fatos");
    expect(classificarTitulo("PRELIMINARMENTE")).toBe("preliminares");
    expect(classificarTitulo("II – DA PRESCRIÇÃO")).toBe("preliminares");
    expect(classificarTitulo("DA ILEGITIMIDADE PASSIVA")).toBe("preliminares");
    expect(classificarTitulo("DA INCOMPETÊNCIA")).toBe("preliminares");
    expect(classificarTitulo("DO MÉRITO")).toBe("fundamentos");
    expect(classificarTitulo("DOS PEDIDOS")).toBe("pedidos");
    expect(classificarTitulo("DA JUSTIÇA GRATUITA")).toBe("outra");
  });
});

describe("dividirEmSecoes", () => {
  it("separa uma peça nas seções esperadas, na ordem", () => {
    const trechos = dividirEmSecoes(peca);
    expect(trechos.map((trecho) => trecho.secao)).toEqual([
      "enderecamento",
      "qualificacao",
      "fatos",
      "fundamentos",
      "pedidos",
      "fechamento",
    ]);
    expect(trechos.find((trecho) => trecho.secao === "fundamentos")?.texto).toContain("art. 479");
    expect(trechos.find((trecho) => trecho.secao === "fatos")?.titulo).toBe("I – DOS FATOS");
    expect(trechos.at(-1)?.texto).toContain("pede deferimento");
  });

  it("quebra seções longas em trechos de até 1.500 caracteres", () => {
    const paragrafo = "Argumento longo sobre o laudo pericial e a prova dos autos. ".repeat(20);
    const texto = `DO DIREITO\n${Array(5).fill(paragrafo).join("\n")}`;
    const trechos = dividirEmSecoes(texto);
    expect(trechos.length).toBeGreaterThan(1);
    expect(trechos.every((trecho) => trecho.texto.length <= 1500)).toBe(true);
    expect(trechos.every((trecho) => trecho.secao === "fundamentos")).toBe(true);
  });

  it("sem títulos, guarda o texto como outra", () => {
    const texto =
      "Texto corrido de uma manifestação simples sem títulos, mas com conteúdo suficiente.";
    expect(dividirEmSecoes(texto)).toEqual([{ secao: "outra", titulo: null, texto }]);
  });
});

function respostaVoyage(quantidade: number, inicio = 0) {
  return new Response(
    JSON.stringify({
      data: Array.from({ length: quantidade }, (_, i) => ({
        embedding: Array(1024).fill(inicio + i),
        index: i,
      })),
      usage: { total_tokens: quantidade * 100 },
    }),
    { status: 200 },
  );
}

describe("gerarEmbeddings", () => {
  it("envia em lotes e devolve os vetores na ordem, com tokens e custo", async () => {
    const buscar = vi.fn(async (_url: string | URL | Request, pedido?: RequestInit) => {
      const corpo = JSON.parse(String(pedido?.body)) as { input: string[]; input_type: string };
      expect(corpo.input_type).toBe("document");
      return respostaVoyage(corpo.input.length);
    });
    const textos = Array.from({ length: 70 }, (_, i) => `trecho ${i}`);
    const resultado = await gerarEmbeddings(textos, { chave: "x", tipo: "document", buscar });
    expect(buscar).toHaveBeenCalledTimes(2);
    expect(resultado.vetores).toHaveLength(70);
    expect(resultado.tokens).toBe(7000);
    expect(resultado.custoEstimado).toBeCloseTo(0.00084, 6);
  });

  it("erro 400 é definitivo; 429 e 500 podem ser tentados de novo", async () => {
    const com = (status: number) => vi.fn(async () => new Response("{}", { status }));
    await expect(
      gerarEmbeddings(["a"], { chave: "x", tipo: "query", buscar: com(400) }),
    ).rejects.toBeInstanceOf(ErroEmbeddingsDefinitivo);
    for (const status of [429, 500]) {
      const erro = await gerarEmbeddings(["a"], {
        chave: "x",
        tipo: "query",
        buscar: com(status),
      }).catch((e: unknown) => e);
      expect(erro).toBeInstanceOf(Error);
      expect(erro).not.toBeInstanceOf(ErroEmbeddingsDefinitivo);
    }
  });

  it("formata o vetor para o pgvector", () => {
    expect(vetorParaPgvector([0.1, -2, 3])).toBe("[0.1,-2,3]");
  });
});
