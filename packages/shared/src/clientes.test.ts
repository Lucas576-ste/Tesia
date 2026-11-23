import { describe, expect, it } from "vitest";
import { extrairHashtags, mascaraTelefoneEntrada, papelDaOrigem, validarCelular } from "./clientes";

describe("papelDaOrigem", () => {
  it("parte contrária como origem gera o papel parte contrária", () => {
    expect(papelDaOrigem("parte_contraria")).toBe("parte_contraria");
    expect(papelDaOrigem("parte_contraria", "testemunha")).toBe("parte_contraria");
  });

  it("outras origens mantêm o papel escolhido, sem permitir parte contrária", () => {
    expect(papelDaOrigem("indicacao")).toBe("cliente");
    expect(papelDaOrigem("google", "testemunha")).toBe("testemunha");
    expect(papelDaOrigem("outro", "parte_contraria")).toBe("cliente");
  });
});

describe("validarCelular", () => {
  it("aceita celular com DDD, com ou sem máscara", () => {
    expect(validarCelular("(61) 99999-1234")).toBe(true);
    expect(validarCelular("61999991234")).toBe(true);
  });

  it("recusa fixo, sem DDD, DDD inválido e tamanho errado", () => {
    expect(validarCelular("(61) 3333-1234")).toBe(false);
    expect(validarCelular("99999-1234")).toBe(false);
    expect(validarCelular("(01) 99999-1234")).toBe(false);
    expect(validarCelular("(61) 89999-1234")).toBe(false);
    expect(validarCelular("619999912345")).toBe(false);
  });
});

describe("mascaraTelefoneEntrada", () => {
  it("aplica a máscara enquanto digita", () => {
    expect(mascaraTelefoneEntrada("")).toBe("");
    expect(mascaraTelefoneEntrada("6")).toBe("(6");
    expect(mascaraTelefoneEntrada("619")).toBe("(61) 9");
    expect(mascaraTelefoneEntrada("6199999")).toBe("(61) 9999-9");
    expect(mascaraTelefoneEntrada("61999991234")).toBe("(61) 99999-1234");
    expect(mascaraTelefoneEntrada("619999912345678")).toBe("(61) 99999-1234");
  });
});

describe("extrairHashtags", () => {
  it("acha as hashtags, em minúsculas e sem repetir", () => {
    expect(extrairHashtags("veio por #Indicação do João, depois #vip e #VIP")).toEqual([
      "indicação",
      "vip",
    ]);
  });

  it("ignora texto sem hashtag, # solto e # no meio de palavra", () => {
    expect(extrairHashtags(null)).toEqual([]);
    expect(extrairHashtags("sem tag # nenhuma a#b")).toEqual([]);
  });
});
