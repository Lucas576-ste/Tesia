import { describe, expect, it } from "vitest";
import { mascararCnpj, mascararCpf, validarCnpj, validarCpf } from "./cpf-cnpj";
import { camposFaltando, textoQualificacao } from "./qualificacao";

describe("cpf e cnpj", () => {
  it("valida dígitos", () => {
    expect(validarCpf("529.982.247-25")).toBe(true);
    expect(validarCpf("529.982.247-24")).toBe(false);
    expect(validarCpf("111.111.111-11")).toBe(false);
    expect(validarCnpj("11.222.333/0001-81")).toBe(true);
    expect(validarCnpj("11.222.333/0001-80")).toBe(false);
  });

  it("aplica máscara enquanto digita", () => {
    expect(mascararCpf("5299822")).toBe("529.982.2");
    expect(mascararCpf("52998224725")).toBe("529.982.247-25");
    expect(mascararCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });
});

describe("textoQualificacao", () => {
  const endereco = {
    cep: "70000-000",
    logradouro: "SQS 308 Bloco A",
    numero: "101",
    complemento: "",
    bairro: "Asa Sul",
    cidade: "Brasília",
    uf: "df",
  };

  it("monta a qualificação completa de pessoa física", () => {
    const texto = textoQualificacao({
      nome: "Maria da Silva",
      documento: "52998224725",
      tipo_pessoa: "pf",
      qualificacao: {
        rg: "1.234.567",
        rg_orgao: "SSP/DF",
        nacionalidade: "brasileira",
        estado_civil: "casado",
        profissao: "professora",
        endereco,
      },
    });
    expect(texto).toBe(
      "MARIA DA SILVA, brasileira, casado(a), professora, portador(a) do RG 1.234.567 SSP/DF, inscrito(a) no CPF sob o nº 529.982.247-25, residente e domiciliado(a) na SQS 308 Bloco A, 101, Asa Sul, Brasília/DF, CEP 70000-000",
    );
  });

  it("marca o que falta com CONFIRMAR", () => {
    const cliente = { nome: "João", documento: null, tipo_pessoa: "pf" as const, qualificacao: {} };
    expect(textoQualificacao(cliente)).toContain("[CONFIRMAR: CPF]");
    expect(textoQualificacao(cliente)).toContain("[CONFIRMAR: endereço]");
    expect(camposFaltando(cliente)).toHaveLength(6);
  });

  it("monta a qualificação de pessoa jurídica com representante", () => {
    const texto = textoQualificacao({
      nome: "Construtora Planalto Ltda",
      documento: "11222333000181",
      tipo_pessoa: "pj",
      qualificacao: {
        representante_nome: "Carlos Souza",
        representante_cpf: "52998224725",
        representante_cargo: "sócio-administrador",
        endereco,
      },
    });
    expect(texto).toContain("inscrita no CNPJ sob o nº 11.222.333/0001-81");
    expect(texto).toContain(
      "representada por Carlos Souza, sócio-administrador, CPF 529.982.247-25",
    );
  });
});
