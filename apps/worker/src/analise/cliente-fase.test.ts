import { describe, expect, it } from "vitest";
import { nomeDoCliente } from "./cliente-fase";

const dados = {
  partes: [
    { nome: "Maria Lima", polo: "ativo" as const },
    { nome: "João Lima", polo: "ativo" as const },
    { nome: "INSS", polo: "passivo" as const },
  ],
};

describe("cliente do processo", () => {
  it("usa as partes do polo do cliente", () => {
    expect(nomeDoCliente({ dados: { ...dados, polo_cliente: "ativo" } } as never)).toBe(
      "Maria Lima, João Lima",
    );
    expect(nomeDoCliente({ dados: { ...dados, polo_cliente: "passivo" } } as never)).toBe("INSS");
  });
  it("sem polo do cliente, não liga ninguém", () => {
    expect(nomeDoCliente({ dados: { ...dados, polo_cliente: null } } as never)).toBeNull();
  });
});
