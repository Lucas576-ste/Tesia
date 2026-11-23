import { somenteDigitos } from "./cpf-cnpj";

export const ORIGENS = {
  indicacao: "Indicação",
  redes_sociais: "Redes sociais",
  google: "Google",
  parte_contraria: "Parte contrária",
  outro: "Outro",
} as const;

export type OrigemCliente = keyof typeof ORIGENS;

export const CODIGOS_ORIGEM = Object.keys(ORIGENS) as [OrigemCliente, ...OrigemCliente[]];

export const PAPEIS = {
  cliente: "Cliente",
  parte_contraria: "Parte contrária",
  testemunha: "Testemunha",
} as const;

export type PapelCliente = keyof typeof PAPEIS;

export const CODIGOS_PAPEL = Object.keys(PAPEIS) as [PapelCliente, ...PapelCliente[]];

export const GENEROS = {
  feminino: "Feminino",
  masculino: "Masculino",
  outro: "Outro",
  nao_informado: "Prefiro não informar",
} as const;

export type GeneroCliente = keyof typeof GENEROS;

export const CODIGOS_GENERO = Object.keys(GENEROS) as [GeneroCliente, ...GeneroCliente[]];

export function papelDaOrigem(
  origem: OrigemCliente,
  papelEscolhido: PapelCliente = "cliente",
): PapelCliente {
  if (origem === "parte_contraria") return "parte_contraria";
  return papelEscolhido === "parte_contraria" ? "cliente" : papelEscolhido;
}

export function validarCelular(valor: string) {
  return /^[1-9][1-9]9\d{8}$/.test(somenteDigitos(valor));
}

export function mascaraTelefoneEntrada(valor: string) {
  const digitos = somenteDigitos(valor).slice(0, 11);
  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function extrairHashtags(texto: string | null | undefined) {
  const achadas = (texto ?? "").matchAll(/(?:^|\s)#([\p{L}\p{N}_]{2,})/gu);
  return [...new Set([...achadas].map(([, tag]) => (tag ?? "").toLocaleLowerCase("pt-BR")))];
}
