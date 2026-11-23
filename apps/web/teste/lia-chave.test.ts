import { describe, expect, it } from "vitest";
import { descreverValor, extrairChave } from "@/lib/lia/chave";

const CHAVE = "sk-ant-api03-AbC_123-xyz";

describe("extrairChave", () => {
  it.each([
    ["valor limpo", CHAVE],
    ["linha inteira", `ANTHROPIC_API_KEY=${CHAVE}`],
    ["aspas duplas", `"${CHAVE}"`],
    ["aspas simples", `'${CHAVE}'`],
    ["com a palavra Bearer", `Bearer ${CHAVE}`],
    ["com espaços e quebra de linha", `  ${CHAVE}\n`],
  ])("acha a chave em %s", (_rotulo, valor) => {
    expect(extrairChave(valor)).toBe(CHAVE);
  });

  it("devolve null quando não há chave da Anthropic", () => {
    expect(extrairChave(undefined)).toBeNull();
    expect(extrairChave("")).toBeNull();
    expect(extrairChave("pa-chave-da-voyage-123")).toBeNull();
    expect(extrairChave("qualquer texto")).toBeNull();
  });
});

describe("descreverValor", () => {
  it("descreve só o formato, sem o conteúdo", () => {
    const descricao = descreverValor(`"ANTHROPIC_API_KEY=${CHAVE}"`);
    expect(descricao).toEqual({
      tamanho: 44,
      comeca: '"AN',
      temAspas: true,
      temIgual: true,
      temEspaco: false,
    });
    expect(JSON.stringify(descricao)).not.toContain(CHAVE);
  });
});
