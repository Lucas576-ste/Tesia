import { z } from "zod";
import { mascararCnpj, mascararCpf } from "./cpf-cnpj";

const texto = (max: number) => z.string().trim().max(max).optional().default("");

export const ESTADOS_CIVIS = {
  solteiro: "solteiro(a)",
  casado: "casado(a)",
  divorciado: "divorciado(a)",
  viuvo: "viúvo(a)",
  uniao_estavel: "em união estável",
} as const;

export const enderecoSchema = z.object({
  cep: texto(9),
  logradouro: texto(200),
  numero: texto(20),
  complemento: texto(100),
  bairro: texto(100),
  cidade: texto(100),
  uf: texto(2),
});

export const qualificacaoSchema = z.object({
  rg: texto(30),
  rg_orgao: texto(20),
  nacionalidade: texto(50),
  estado_civil: z
    .union([z.enum(Object.keys(ESTADOS_CIVIS) as [keyof typeof ESTADOS_CIVIS]), z.literal("")])
    .optional()
    .default(""),
  profissao: texto(100),
  nome_fantasia: texto(200),
  representante_nome: texto(200),
  representante_cpf: texto(14),
  representante_cargo: texto(100),
  endereco: enderecoSchema.optional().default(enderecoSchema.parse({})),
});

export type Qualificacao = z.output<typeof qualificacaoSchema>;

export type ClienteQualificavel = {
  nome: string;
  documento: string | null;
  tipo_pessoa: "pf" | "pj";
  qualificacao: unknown;
};

const falta = (o_que: string) => `[CONFIRMAR: ${o_que}]`;

function textoEndereco(e: Qualificacao["endereco"]) {
  if (!e.logradouro || !e.cidade) return falta("endereço");
  const partes = [
    `${e.logradouro}, ${e.numero || "s/n"}`,
    e.complemento,
    e.bairro,
    `${e.cidade}/${e.uf.toUpperCase()}`,
    e.cep && `CEP ${e.cep}`,
  ].filter(Boolean);
  return partes.join(", ");
}

export function camposFaltando(cliente: ClienteQualificavel) {
  const q = qualificacaoSchema.parse(cliente.qualificacao ?? {});
  const base = [
    ["documento", cliente.documento],
    ["endereço", q.endereco.logradouro && q.endereco.cidade],
  ];
  const especificos =
    cliente.tipo_pessoa === "pf"
      ? [
          ["RG", q.rg],
          ["nacionalidade", q.nacionalidade],
          ["estado civil", q.estado_civil],
          ["profissão", q.profissao],
        ]
      : [
          ["representante legal", q.representante_nome],
          ["CPF do representante", q.representante_cpf],
          ["cargo do representante", q.representante_cargo],
        ];
  return [...base, ...especificos].filter(([, valor]) => !valor).map(([nome]) => nome as string);
}

export function textoQualificacao(cliente: ClienteQualificavel) {
  const q = qualificacaoSchema.parse(cliente.qualificacao ?? {});
  const nome = cliente.nome.toUpperCase();
  const endereco = textoEndereco(q.endereco);
  if (cliente.tipo_pessoa === "pj") {
    const cnpj = cliente.documento ? mascararCnpj(cliente.documento) : falta("CNPJ");
    const fantasia = q.nome_fantasia ? ` (${q.nome_fantasia})` : "";
    const representante = q.representante_nome
      ? `${q.representante_nome}, ${q.representante_cargo || falta("cargo")}, CPF ${
          q.representante_cpf ? mascararCpf(q.representante_cpf) : falta("CPF do representante")
        }`
      : falta("representante legal");
    return `${nome}${fantasia}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${cnpj}, com sede na ${endereco}, neste ato representada por ${representante}`;
  }
  const cpf = cliente.documento ? mascararCpf(cliente.documento) : falta("CPF");
  const rg = q.rg ? `RG ${q.rg}${q.rg_orgao ? ` ${q.rg_orgao}` : ""}` : falta("RG");
  return [
    nome,
    q.nacionalidade || falta("nacionalidade"),
    q.estado_civil ? ESTADOS_CIVIS[q.estado_civil] : falta("estado civil"),
    q.profissao || falta("profissão"),
    `portador(a) do ${rg}`,
    `inscrito(a) no CPF sob o nº ${cpf}`,
    `residente e domiciliado(a) na ${endereco}`,
  ].join(", ");
}
