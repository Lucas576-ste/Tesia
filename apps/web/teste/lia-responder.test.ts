import { describe, expect, it, vi } from "vitest";
import { MENSAGEM_JURIDICA } from "@/lib/lia/porteiro";
import {
  decidirPergunta,
  gerarResposta,
  turnosParaModelo,
  type ClienteChat,
} from "@/lib/lia/responder";

const USO = { input_tokens: 100, output_tokens: 20 };

function clienteCom(eventos: string[], falharNoFim = false): ClienteChat {
  return {
    messages: {
      stream: () => {
        async function* gerar() {
          for (const texto of eventos) {
            yield { type: "content_block_delta", delta: { type: "text_delta", text: texto } };
          }
          if (falharNoFim) throw new Error("rede caiu");
        }
        return Object.assign(gerar(), {
          finalMessage: async () => ({ usage: USO }),
          abort: () => undefined,
        });
      },
    },
  };
}

describe("decidirPergunta", () => {
  it("recusa pergunta jurídica aberta com a mensagem padrão, sem chamar o modelo", () => {
    for (const pergunta of [
      "Qual a melhor tese para contestar uma cobrança indevida?",
      "Existe jurisprudência sobre dano moral em voo atrasado?",
    ]) {
      const decisao = decidirPergunta({
        mensagem: pergunta,
        usadas: 0,
        limite: 10,
        reenvio: false,
      });
      expect(decisao.tipo).toBe("juridica");
      expect(decisao.tipo === "juridica" && decisao.resposta.startsWith(MENSAGEM_JURIDICA)).toBe(
        true,
      );
    }
  });

  it("deixa passar perguntas de uso da Tesia", () => {
    for (const pergunta of ["Como o prazo é calculado?", "Como corrijo o que a Lia aprendeu?"]) {
      expect(
        decidirPergunta({ mensagem: pergunta, usadas: 0, limite: 10, reenvio: false }),
      ).toEqual({ tipo: "modelo" });
    }
  });

  it("bloqueia quando o limite diário acabou", () => {
    expect(
      decidirPergunta({ mensagem: "Como uso a Tesia?", usadas: 10, limite: 10, reenvio: false }),
    ).toEqual({ tipo: "limite" });
  });

  it("não cobra de novo ao tentar a mesma pergunta outra vez", () => {
    expect(
      decidirPergunta({ mensagem: "Como uso a Tesia?", usadas: 10, limite: 10, reenvio: true }),
    ).toEqual({ tipo: "modelo" });
  });
});

describe("gerarResposta", () => {
  it("junta o texto do stream e devolve o uso", async () => {
    const pedacos: string[] = [];
    const resultado = await gerarResposta(
      clienteCom(["Oi, ", "tudo bem?"]),
      { sistema: "s", mensagens: [{ role: "user", content: "oi" }] },
      (pedaco) => pedacos.push(pedaco),
    );
    expect(resultado).toMatchObject({ texto: "Oi, tudo bem?", falhou: false, interrompida: false });
    expect(resultado.uso).toEqual(USO);
    expect(pedacos).toEqual(["Oi, ", "tudo bem?"]);
  });

  it("falha de rede no meio do stream marca falha e mantém o que chegou", async () => {
    const resultado = await gerarResposta(
      clienteCom(["Parcial"], true),
      { sistema: "s", mensagens: [{ role: "user", content: "oi" }] },
      vi.fn(),
    );
    expect(resultado).toMatchObject({ texto: "Parcial", falhou: true, uso: null });
  });

  it("falha ao abrir a conexão marca falha sem texto", async () => {
    const cliente: ClienteChat = {
      messages: {
        stream: () => {
          throw new Error("sem rede");
        },
      },
    };
    const resultado = await gerarResposta(
      cliente,
      { sistema: "s", mensagens: [{ role: "user", content: "oi" }] },
      vi.fn(),
    );
    expect(resultado).toMatchObject({ texto: "", falhou: true });
  });

  it("interrupção pelo usuário não conta como falha", async () => {
    const controle = new AbortController();
    controle.abort();
    const cliente: ClienteChat = {
      messages: {
        stream: () => {
          throw new Error("abortado");
        },
      },
    };
    const resultado = await gerarResposta(
      cliente,
      { sistema: "s", mensagens: [{ role: "user", content: "oi" }], signal: controle.signal },
      vi.fn(),
    );
    expect(resultado).toMatchObject({ interrompida: true, falhou: false });
  });
});

describe("turnosParaModelo", () => {
  it("começa na pergunta do usuário e alterna papéis", () => {
    expect(
      turnosParaModelo([
        { papel: "lia", conteudo: "a" },
        { papel: "usuario", conteudo: "b" },
        { papel: "usuario", conteudo: "c" },
        { papel: "lia", conteudo: "d" },
        { papel: "usuario", conteudo: "e" },
      ]),
    ).toEqual([
      { role: "user", content: "c" },
      { role: "assistant", content: "d" },
      { role: "user", content: "e" },
    ]);
  });
});
