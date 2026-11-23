import { describe, expect, it } from "vitest";
import {
  dadosClienteSchema,
  formularioDoCliente,
  mensagemDuplicidade,
  montarColunasCliente,
} from "@/lib/cliente-tipos";

const CPF = "529.982.247-25";
const CNPJ = "11.222.333/0001-81";
const base = { nome: "Maria da Silva", origem: "indicacao" } as const;

function primeiroErro(entrada: unknown) {
  const resultado = dadosClienteSchema.safeParse(entrada);
  return resultado.success ? null : (resultado.error.issues[0]?.message ?? null);
}

describe("dadosClienteSchema", () => {
  it("exige nome e origem", () => {
    expect(primeiroErro({ origem: "google" })).toBe(
      "Invalid input: expected string, received undefined",
    );
    expect(primeiroErro({ nome: "A", origem: "google" })).toBe("Informe o nome.");
    expect(primeiroErro({ nome: "Maria da Silva" })).toBe("Escolha a origem.");
  });

  it("aceita o cadastro mínimo, com documento opcional", () => {
    const resultado = dadosClienteSchema.parse(base);
    expect(resultado).toMatchObject({ tipo_pessoa: "pf", papel: "cliente", documento: "" });
  });

  it("valida os dígitos do CPF e do CNPJ e guarda só os números", () => {
    expect(primeiroErro({ ...base, documento: "111.111.111-11" })).toBe("CPF inválido.");
    expect(primeiroErro({ ...base, tipo_pessoa: "pj", documento: "11.222.333/0001-80" })).toBe(
      "CNPJ inválido.",
    );
    expect(dadosClienteSchema.parse({ ...base, documento: CPF }).documento).toBe("52998224725");
    expect(
      dadosClienteSchema.parse({ ...base, tipo_pessoa: "pj", documento: CNPJ }).documento,
    ).toBe("11222333000181");
  });

  it("deriva o papel da origem: parte contrária manda", () => {
    expect(dadosClienteSchema.parse({ ...base, origem: "parte_contraria" }).papel).toBe(
      "parte_contraria",
    );
    expect(dadosClienteSchema.parse({ ...base, papel: "testemunha" }).papel).toBe("testemunha");
    expect(dadosClienteSchema.parse({ ...base, papel: "parte_contraria" }).papel).toBe("cliente");
  });

  it("valida celular com DDD, e-mail e data de nascimento", () => {
    expect(primeiroErro({ ...base, celular: "(61) 3333-1234" })).toBe("Informe o celular com DDD.");
    expect(primeiroErro({ ...base, email: "sem-arroba" })).toBe("E-mail inválido.");
    expect(primeiroErro({ ...base, data_nascimento: "2999-01-01" })).toBe(
      "Informe uma data de nascimento válida.",
    );
    expect(dadosClienteSchema.parse({ ...base, celular: "(61) 99999-1234" }).celular).toBe(
      "61999991234",
    );
  });
});

describe("montarColunasCliente e formularioDoCliente", () => {
  it("monta as colunas e preserva o que já estava na qualificação", () => {
    const dados = dadosClienteSchema.parse({
      ...base,
      documento: CPF,
      email: "maria@exemplo.com",
      celular: "61999991234",
      rg: "123",
      cidade: "Brasília",
      uf: "df",
    });
    const colunas = montarColunasCliente(dados, { representante_nome: "Carlos" });
    expect(colunas).toMatchObject({
      nome_normalizado: "maria da silva",
      documento: "52998224725",
      origem: "indicacao",
      papel: "cliente",
      contato: { telefone: "61999991234", email: "maria@exemplo.com" },
    });
    expect(colunas.qualificacao.representante_nome).toBe("Carlos");
    expect(colunas.qualificacao.endereco).toMatchObject({ cidade: "Brasília", uf: "DF" });
  });

  it("devolve ao formulário o que foi gravado", () => {
    const valores = formularioDoCliente({
      nome: "Maria da Silva",
      tipo_pessoa: "pf",
      origem: "google",
      papel: "cliente",
      documento: "52998224725",
      contato: { telefone: "61999991234", email: "maria@exemplo.com" },
      data_nascimento: "1990-05-10",
      genero: "feminino",
      representante_id: null,
      observacoes: "veio por #google",
      qualificacao: { rg: "123", endereco: { cidade: "Brasília", uf: "DF" } },
    });
    expect(valores).toMatchObject({
      nome: "Maria da Silva",
      origem: "google",
      documento: "52998224725",
      celular: "61999991234",
      genero: "feminino",
      data_nascimento: "1990-05-10",
      rg: "123",
      cidade: "Brasília",
    });
    expect(formularioDoCliente(null)).toBeNull();
  });
});

describe("mensagemDuplicidade", () => {
  it("diz o documento e o nome de quem já tem o cadastro", () => {
    expect(mensagemDuplicidade("pf", { nome: "Maria da Silva" })).toBe(
      "Já existe um cliente com este CPF: Maria da Silva.",
    );
    expect(mensagemDuplicidade("pj", null)).toBe("Já existe um cliente com este CNPJ.");
  });
});
