import { describe, expect, it } from "vitest";
import { brasilApiCnpjSchema, dadosDoCnpj } from "@/lib/brasilapi";

describe("dadosDoCnpj", () => {
  it("converte a resposta da BrasilAPI nos campos do cadastro", () => {
    const resposta = brasilApiCnpjSchema.parse({
      razao_social: "EMPRESA EXEMPLO LTDA",
      nome_fantasia: "EXEMPLO",
      email: "CONTATO@EXEMPLO.COM.BR",
      ddd_telefone_1: "61999991234",
      cep: "70040010",
      uf: "df",
      municipio: "BRASILIA",
      logradouro: "SBS QUADRA 2",
      numero: "S/N",
      complemento: null,
      bairro: "ASA SUL",
    });
    expect(dadosDoCnpj(resposta)).toEqual({
      nome: "EMPRESA EXEMPLO LTDA",
      nome_fantasia: "EXEMPLO",
      email: "contato@exemplo.com.br",
      celular: "(61) 99999-1234",
      cep: "70040-010",
      logradouro: "Sbs Quadra 2",
      numero: "S/N",
      complemento: "",
      bairro: "Asa Sul",
      cidade: "Brasilia",
      uf: "DF",
    });
  });

  it("não usa telefone fixo como celular e aceita campos vazios", () => {
    const dados = dadosDoCnpj(
      brasilApiCnpjSchema.parse({ razao_social: "X LTDA", ddd_telefone_1: "6133331234" }),
    );
    expect(dados.celular).toBe("");
    expect(dados.email).toBe("");
    expect(dados.cep).toBe("");
  });
});
