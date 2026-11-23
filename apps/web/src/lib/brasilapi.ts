import { mascaraTelefoneEntrada, somenteDigitos, validarCelular } from "@tesia/shared";
import { z } from "zod";

const textoNulo = z.string().nullable().optional();

export const brasilApiCnpjSchema = z.object({
  razao_social: z.string(),
  nome_fantasia: textoNulo,
  email: textoNulo,
  ddd_telefone_1: textoNulo,
  cep: textoNulo,
  uf: textoNulo,
  municipio: textoNulo,
  logradouro: textoNulo,
  numero: textoNulo,
  complemento: textoNulo,
  bairro: textoNulo,
});

export type DadosCnpj = {
  nome: string;
  nome_fantasia: string;
  email: string;
  celular: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

function limpar(valor: string | null | undefined) {
  return (valor ?? "").trim();
}

function titulo(valor: string | null | undefined) {
  return limpar(valor)
    .toLocaleLowerCase("pt-BR")
    .replace(
      /(^|\s)(\p{L})/gu,
      (_, espaco: string, letra: string) => espaco + letra.toLocaleUpperCase("pt-BR"),
    );
}

export function dadosDoCnpj(resposta: z.infer<typeof brasilApiCnpjSchema>): DadosCnpj {
  const telefone = somenteDigitos(limpar(resposta.ddd_telefone_1));
  const cep = somenteDigitos(limpar(resposta.cep));
  return {
    nome: limpar(resposta.razao_social),
    nome_fantasia: limpar(resposta.nome_fantasia),
    email: limpar(resposta.email).toLowerCase(),
    celular: validarCelular(telefone) ? mascaraTelefoneEntrada(telefone) : "",
    cep: cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : "",
    logradouro: titulo(resposta.logradouro),
    numero: limpar(resposta.numero),
    complemento: titulo(resposta.complemento),
    bairro: titulo(resposta.bairro),
    cidade: titulo(resposta.municipio),
    uf: limpar(resposta.uf).toUpperCase().slice(0, 2),
  };
}
