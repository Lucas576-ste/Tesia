import { describe, expect, it, vi } from "vitest";
import { lerDocumento, textoSuficiente } from "../src/leitura.js";
import { RespostaInvalidaDaIa, type Transcricao } from "../src/transcricao.js";
import { montarPdf } from "./pdf-de-teste.js";

const intimacao = [
  "PODER JUDICIARIO - TRIBUNAL REGIONAL FEDERAL DA 1a REGIAO",
  "Processo 1000123-45.2026.4.01.3400 - Procedimento Comum Civel",
  "Autor: Fulano de Tal. Reu: Instituto Nacional do Seguro Social.",
  "Intimacao da sentenca que julgou improcedente o pedido inicial.",
];

function transcricaoFalsa(texto: string): Transcricao {
  return {
    texto,
    versaoPrompt: "transcricao@1",
    duracaoMs: 10,
    uso: {
      modelo: "claude-haiku-5-5",
      tokensEntrada: 1000,
      tokensCache: 0,
      tokensSaida: 200,
      custoEstimado: 0.0002,
    },
  };
}

describe("textoSuficiente", () => {
  it("exige uma quantidade mínima de caracteres por página", () => {
    expect(textoSuficiente("a".repeat(99), 1)).toBe(false);
    expect(textoSuficiente("a".repeat(100), 1)).toBe(true);
    expect(textoSuficiente("a".repeat(150), 2)).toBe(false);
  });

  it("ignora espaços e quebras de linha", () => {
    expect(textoSuficiente(" \n ".repeat(200), 1)).toBe(false);
  });
});

describe("lerDocumento", () => {
  it("usa o texto do próprio PDF quando ele existe", async () => {
    const transcrever = vi.fn();
    const leitura = await lerDocumento(montarPdf(intimacao), { transcrever });
    expect(leitura.origem).toBe("pdf");
    expect(leitura.paginas).toBe(1);
    expect(leitura.texto).toContain("1000123-45.2026.4.01.3400");
    expect(transcrever).not.toHaveBeenCalled();
  });

  it("chama a transcrição quando o PDF não tem texto", async () => {
    const transcrever = vi.fn(async () => transcricaoFalsa("Texto lido pela IA"));
    const leitura = await lerDocumento(montarPdf([]), { transcrever });
    expect(transcrever).toHaveBeenCalledOnce();
    expect(leitura.origem).toBe("ia");
    expect(leitura.texto).toBe("Texto lido pela IA");
  });

  it("falha quando a transcrição volta vazia", async () => {
    const transcrever = vi.fn(async () => transcricaoFalsa("   "));
    await expect(lerDocumento(montarPdf([]), { transcrever })).rejects.toBeInstanceOf(
      RespostaInvalidaDaIa,
    );
  });
});
