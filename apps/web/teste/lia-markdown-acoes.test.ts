import { describe, expect, it } from "vitest";
import { ocultarMarcadores, separarAcoes } from "@/lib/lia/acoes";
import { parsearMarkdown } from "@/lib/lia/markdown";

describe("markdown da Lia", () => {
  it("lê parágrafo, negrito, lista e link interno", () => {
    const blocos = parsearMarkdown(
      "Veja o **prazo** em [Prazos](/app/prazos).\n\n- primeiro\n- segundo\n\n1. um\n2. dois",
    );
    expect(blocos).toHaveLength(3);
    expect(blocos[0]).toMatchObject({ tipo: "paragrafo" });
    expect(blocos[1]).toMatchObject({ tipo: "lista", ordenada: false });
    expect(blocos[2]).toMatchObject({ tipo: "lista", ordenada: true });
    const trechos = blocos[0]?.tipo === "paragrafo" ? blocos[0].trechos : [];
    expect(trechos).toContainEqual({ tipo: "link", texto: "Prazos", href: "/app/prazos" });
    expect(trechos).toContainEqual({ tipo: "negrito", valor: "prazo" });
  });

  it("não cria link para endereços externos", () => {
    const [bloco] = parsearMarkdown("[site](https://exemplo.com) e [x](javascript:alert(1))");
    const trechos = bloco?.tipo === "paragrafo" ? bloco.trechos : [];
    expect(trechos.some((trecho) => trecho.tipo === "link")).toBe(false);
  });
});

describe("ações da Lia", () => {
  it("só gera botões da lista permitida e com rota conhecida", () => {
    const { texto, acoes } = separarAcoes(
      "Aqui está.\n[[acao:abrir_rascunho]]\n[[acao:ver_prazo]]\n[[acao:apagar_tudo]]",
      { pecaId: "p1", processoId: "r1" },
    );
    expect(texto).toBe("Aqui está.");
    expect(acoes).toEqual([
      { id: "abrir_rascunho", rotulo: "Abrir rascunho", href: "/app/pecas/p1" },
      { id: "ver_prazo", rotulo: "Ver prazo deste processo", href: "/app/processos/r1" },
    ]);
  });

  it("omite o botão quando não há id na tela", () => {
    expect(separarAcoes("[[acao:abrir_rascunho]]", {}).acoes).toEqual([]);
    expect(separarAcoes("[[acao:ir_estilo]]", {}).acoes[0]?.href).toBe("/app/estilo");
  });

  it("esconde marcadores completos e incompletos durante o stream", () => {
    expect(ocultarMarcadores("Texto [[acao:ir_estilo]]")).toBe("Texto");
    expect(ocultarMarcadores("Texto [[acao:ir_es")).toBe("Texto");
  });
});
