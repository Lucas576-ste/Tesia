import { describe, expect, it } from "vitest";
import { acrescentarResposta } from "@/components/lia-chat/acrescentar-resposta";
import type { MensagemChat } from "@/components/lia-chat/usar-chat-lia";

const pergunta: MensagemChat = {
  chave: "m1",
  mensagemId: null,
  papel: "usuario",
  conteudo: "Como confirmo um prazo?",
  acoes: [],
  avaliacao: null,
};

describe("acrescentarResposta", () => {
  it("cria a mensagem da Lia no primeiro pedaço e soma os seguintes", () => {
    const primeira = acrescentarResposta([pergunta], "m2", "Você");
    expect(primeira).toHaveLength(2);
    expect(primeira[1]).toMatchObject({ chave: "m2", papel: "lia", conteudo: "Você" });
    const segunda = acrescentarResposta(primeira, "m2", " confirma");
    expect(segunda).toHaveLength(2);
    expect(segunda[1]?.conteudo).toBe("Você confirma");
  });

  it("não altera a pergunta do usuário nem a lista original", () => {
    const base = [pergunta];
    const resultado = acrescentarResposta(base, "m2", "Oi");
    expect(resultado[0]).toBe(pergunta);
    expect(base).toHaveLength(1);
  });

  it("dá o mesmo resultado quando roda duas vezes com a mesma base", () => {
    const base = [pergunta];
    expect(acrescentarResposta(base, "m2", "Oi")).toEqual(acrescentarResposta(base, "m2", "Oi"));
    const comResposta = acrescentarResposta(base, "m2", "Oi");
    expect(acrescentarResposta(comResposta, "m2", "!")).toEqual(
      acrescentarResposta(comResposta, "m2", "!"),
    );
  });
});
