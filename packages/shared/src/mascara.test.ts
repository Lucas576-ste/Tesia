import { describe, expect, it } from "vitest";
import {
  formatarTelefone,
  mascararEmail,
  mascararNome,
  mascararOab,
  mascararTelefone,
} from "./mascara";

describe("máscaras de dados pessoais", () => {
  it("esconde o e-mail mantendo o domínio", () => {
    expect(mascararEmail("ana.souza@gmail.com")).toBe("an*******@gmail.com");
    expect(mascararEmail("ab@x.com")).toBe("ab***@x.com");
  });

  it("esconde o telefone mantendo DDD e o fim", () => {
    expect(mascararTelefone("61991234567")).toBe("(61) *****-**67");
    expect(mascararTelefone(null)).toBe("");
  });

  it("esconde a OAB mantendo a UF", () => {
    expect(mascararOab("12.345", "DF")).toBe("**.***/DF");
    expect(mascararOab(null, "DF")).toBe("");
  });

  it("mostra só o primeiro nome e a inicial do último", () => {
    expect(mascararNome("Ana Maria Souza")).toBe("Ana S****");
    expect(mascararNome("Ana")).toBe("Ana");
  });

  it("formata telefone com 10 ou 11 dígitos", () => {
    expect(formatarTelefone("61991234567")).toBe("(61) 99123-4567");
    expect(formatarTelefone("6133334444")).toBe("(61) 3333-4444");
  });
});
