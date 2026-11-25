import { htmlParaTexto } from "./html-para-texto";

export type TipoPublicacao = "intimacao" | "andamento";
export type PapelUsuario = "dono" | "advogado" | "estagiario";

export function normalizarCnj(valor: string | null | undefined) {
  const digitos = (valor ?? "").replace(/\D/g, "");
  return digitos.length === 20 ? digitos : null;
}

export function formatarCnj(digitos: string) {
  return `${digitos.slice(0, 7)}-${digitos.slice(7, 9)}.${digitos.slice(9, 13)}.${digitos.slice(13, 14)}.${digitos.slice(14, 16)}.${digitos.slice(16, 20)}`;
}

const AVISO_DISTRIBUICAO = /processo distribu[ií]do pelo sistema autom[aá]tico[^.]{0,40}\.?\s*$/i;

export function classificarPublicacao({
  tipoDocumento,
  texto,
}: {
  tipoDocumento?: string | null;
  texto?: string | null;
}): TipoPublicacao {
  if (/distribui[cç]/i.test(tipoDocumento ?? "")) return "andamento";
  const limpo = htmlParaTexto(texto ?? "").trim();
  if (AVISO_DISTRIBUICAO.test(limpo) && !/intim|cite-se|cita[cç][aã]o|prazo/i.test(limpo))
    return "andamento";
  return "intimacao";
}

export function podeDesvincularProcesso(papel: PapelUsuario) {
  return papel === "dono";
}

export function podeGerenciarTermos(papel: PapelUsuario) {
  return papel === "dono" || papel === "advogado";
}
