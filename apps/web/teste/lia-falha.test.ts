import { describe, expect, it, vi } from "vitest";
import { resumirFalha } from "@/lib/lia/falha";
import { gerarResposta, type ClienteChat } from "@/lib/lia/responder";

describe("resumirFalha", () => {
  it("devolve status, tipo e mensagem cortada de um erro no formato do SDK", () => {
    const erro = Object.assign(new Error("401 invalid x-api-key " + "x".repeat(400)), {
      status: 401,
      error: { error: { type: "authentication_error" } },
    });
    const resumo = resumirFalha(erro);
    expect(resumo.status).toBe(401);
    expect(resumo.tipo).toBe("authentication_error");
    expect(resumo.mensagem).toHaveLength(200);
    expect(Object.keys(resumo).sort()).toEqual(["mensagem", "status", "tipo"]);
  });

  it("aceita um erro comum e um valor qualquer", () => {
    expect(resumirFalha(new TypeError("falha de rede"))).toEqual({
      status: null,
      tipo: "TypeError",
      mensagem: "falha de rede",
    });
    expect(resumirFalha("texto solto")).toEqual({
      status: null,
      tipo: null,
      mensagem: "erro desconhecido",
    });
  });
});

function clienteQueFalha(erro: Error): ClienteChat {
  return {
    messages: {
      stream: () => {
        throw erro;
      },
    },
  };
}

describe("gerarResposta com falha", () => {
  it("chama aoFalhar uma vez e marca falhou", async () => {
    const aoFalhar = vi.fn();
    const resultado = await gerarResposta(
      clienteQueFalha(new Error("quebrou")),
      { sistema: "s", mensagens: [{ role: "user", content: "oi" }] },
      () => undefined,
      aoFalhar,
    );
    expect(resultado.falhou).toBe(true);
    expect(aoFalhar).toHaveBeenCalledTimes(1);
  });

  it("não chama aoFalhar quando o usuário interrompeu", async () => {
    const aoFalhar = vi.fn();
    const controle = new AbortController();
    controle.abort();
    const resultado = await gerarResposta(
      clienteQueFalha(new Error("abortado")),
      { sistema: "s", mensagens: [{ role: "user", content: "oi" }], signal: controle.signal },
      () => undefined,
      aoFalhar,
    );
    expect(resultado.interrompida).toBe(true);
    expect(aoFalhar).not.toHaveBeenCalled();
  });
});
