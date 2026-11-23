import {
  CODIGOS_GENERO,
  CODIGOS_ORIGEM,
  CODIGOS_PAPEL,
  ESTADOS_CIVIS,
  normalizarNome,
  papelDaOrigem,
  qualificacaoSchema,
  somenteDigitos,
  validarCelular,
  validarCnpj,
  validarCpf,
} from "@tesia/shared";
import { z } from "zod";
import { hojeBrasilia } from "@/lib/hoje";

export { qualificacaoSchema, type Qualificacao } from "@tesia/shared";

const texto = (maximo: number) => z.string().trim().max(maximo).optional().default("");
const dataOpcional = z
  .union([z.iso.date("Informe uma data válida."), z.literal("")])
  .optional()
  .default("");
const CODIGOS_ESTADO_CIVIL = Object.keys(ESTADOS_CIVIS) as [
  keyof typeof ESTADOS_CIVIS,
  ...(keyof typeof ESTADOS_CIVIS)[],
];

export const dadosClienteSchema = z
  .object({
    tipo_pessoa: z.enum(["pf", "pj"]).optional().default("pf"),
    nome: z.string().trim().min(2, "Informe o nome.").max(200),
    origem: z.enum(CODIGOS_ORIGEM, { error: "Escolha a origem." }),
    papel: z.enum(CODIGOS_PAPEL).optional().default("cliente"),
    documento: texto(20),
    email: z
      .union([z.email("E-mail inválido."), z.literal("")])
      .optional()
      .default(""),
    celular: texto(20),
    data_nascimento: dataOpcional,
    genero: z
      .union([z.enum(CODIGOS_GENERO), z.literal("")])
      .optional()
      .default(""),
    representante_id: z
      .union([z.uuid(), z.literal("")])
      .optional()
      .default(""),
    observacoes: texto(5000),
    rg: texto(30),
    rg_orgao: texto(20),
    nacionalidade: texto(50),
    estado_civil: z
      .union([z.enum(CODIGOS_ESTADO_CIVIL), z.literal("")])
      .optional()
      .default(""),
    profissao: texto(100),
    nome_fantasia: texto(200),
    cep: texto(9),
    logradouro: texto(200),
    numero: texto(20),
    complemento: texto(100),
    bairro: texto(100),
    cidade: texto(100),
    uf: texto(2),
  })
  .superRefine((dados, contexto) => {
    if (dados.documento) {
      const valido =
        dados.tipo_pessoa === "pf" ? validarCpf(dados.documento) : validarCnpj(dados.documento);
      if (!valido)
        contexto.addIssue({
          code: "custom",
          path: ["documento"],
          message: dados.tipo_pessoa === "pf" ? "CPF inválido." : "CNPJ inválido.",
        });
    }
    if (dados.celular && !validarCelular(dados.celular))
      contexto.addIssue({
        code: "custom",
        path: ["celular"],
        message: "Informe o celular com DDD.",
      });
    if (
      dados.data_nascimento &&
      (dados.data_nascimento > hojeBrasilia() || dados.data_nascimento < "1900-01-01")
    )
      contexto.addIssue({
        code: "custom",
        path: ["data_nascimento"],
        message: "Informe uma data de nascimento válida.",
      });
  })
  .transform((dados) => ({
    ...dados,
    papel: papelDaOrigem(dados.origem, dados.papel),
    documento: somenteDigitos(dados.documento),
    celular: somenteDigitos(dados.celular),
  }));

export type DadosCliente = z.input<typeof dadosClienteSchema>;
export type DadosClienteValidados = z.output<typeof dadosClienteSchema>;

export const extrasClienteSchema = z.object({
  pix: z.string().trim().max(140).optional().default(""),
  observacoes: z.string().trim().max(5000).optional().default(""),
});

export type ExtrasCliente = z.input<typeof extrasClienteSchema>;

export function montarColunasCliente(
  dados: DadosClienteValidados,
  qualificacaoAtual: unknown = null,
) {
  const qualificacao = qualificacaoSchema.parse({
    ...(typeof qualificacaoAtual === "object" && qualificacaoAtual ? qualificacaoAtual : {}),
    rg: dados.rg,
    rg_orgao: dados.rg_orgao,
    nacionalidade: dados.nacionalidade,
    estado_civil: dados.estado_civil,
    profissao: dados.profissao,
    nome_fantasia: dados.nome_fantasia,
    endereco: {
      cep: dados.cep,
      logradouro: dados.logradouro,
      numero: dados.numero,
      complemento: dados.complemento,
      bairro: dados.bairro,
      cidade: dados.cidade,
      uf: dados.uf.toUpperCase(),
    },
  });
  return {
    tipo_pessoa: dados.tipo_pessoa,
    nome: dados.nome,
    nome_normalizado: normalizarNome(dados.nome),
    documento: dados.documento || null,
    origem: dados.origem,
    papel: dados.papel,
    data_nascimento: dados.data_nascimento || null,
    genero: dados.genero || null,
    representante_id: dados.representante_id || null,
    observacoes: dados.observacoes || null,
    contato: {
      telefone: dados.celular || undefined,
      email: dados.email || undefined,
    },
    qualificacao,
  };
}

const linhaClienteSchema = z.object({
  tipo_pessoa: z.enum(["pf", "pj"]).catch("pf"),
  nome: z.string(),
  origem: z.enum(CODIGOS_ORIGEM).catch("outro"),
  papel: z.enum(CODIGOS_PAPEL).catch("cliente"),
  documento: z.string().nullable(),
  contato: z
    .object({ telefone: z.string().optional(), email: z.string().optional() })
    .nullable()
    .catch(null),
  data_nascimento: z.string().nullable().catch(null),
  genero: z.string().nullable().catch(null),
  representante_id: z.string().nullable().catch(null),
  observacoes: z.string().nullable().catch(null),
  qualificacao: z.unknown(),
});

export function formularioDoCliente(linha: unknown): DadosCliente | null {
  const lida = linhaClienteSchema.safeParse(linha);
  if (!lida.success) return null;
  const { qualificacao: bruta, contato, ...resto } = lida.data;
  const qualificacao = qualificacaoSchema.parse(bruta ?? {});
  const generoValido = CODIGOS_GENERO.find((codigo) => codigo === resto.genero);
  return {
    tipo_pessoa: resto.tipo_pessoa,
    nome: resto.nome,
    origem: resto.origem,
    papel: resto.papel,
    documento: resto.documento ?? "",
    email: contato?.email ?? "",
    celular: contato?.telefone ?? "",
    data_nascimento: resto.data_nascimento ?? "",
    genero: generoValido ?? "",
    representante_id: resto.representante_id ?? "",
    observacoes: resto.observacoes ?? "",
    rg: qualificacao.rg,
    rg_orgao: qualificacao.rg_orgao,
    nacionalidade: qualificacao.nacionalidade,
    estado_civil: qualificacao.estado_civil,
    profissao: qualificacao.profissao,
    nome_fantasia: qualificacao.nome_fantasia,
    cep: qualificacao.endereco.cep,
    logradouro: qualificacao.endereco.logradouro,
    numero: qualificacao.endereco.numero,
    complemento: qualificacao.endereco.complemento,
    bairro: qualificacao.endereco.bairro,
    cidade: qualificacao.endereco.cidade,
    uf: qualificacao.endereco.uf,
  };
}

export function mensagemDuplicidade(tipo: "pf" | "pj", existente: { nome: string } | null) {
  const rotulo = tipo === "pf" ? "CPF" : "CNPJ";
  return existente
    ? `Já existe um cliente com este ${rotulo}: ${existente.nome}.`
    : `Já existe um cliente com este ${rotulo}.`;
}
