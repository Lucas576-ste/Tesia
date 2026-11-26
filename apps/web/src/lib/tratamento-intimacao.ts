import { formatarCnj, normalizarCnj } from "@tesia/shared";

export type SituacaoTratamento = "pendente" | "concluida" | "ignorada";

export function podeTratarIntimacao(responsavelId: string | null, usuarioId: string) {
  return responsavelId === null || responsavelId === usuarioId;
}

export function resumoDoLote(feitas: number, puladas: number, verbo: string) {
  const alvo = (n: number) => (n === 1 ? "1 intimação" : `${n} intimações`);
  if (feitas === 0) return `Nenhuma intimação ${verbo}: só o responsável trata cada uma.`;
  if (puladas === 0) return `${alvo(feitas)} ${verbo}.`;
  return `${alvo(feitas)} ${verbo}. ${alvo(puladas)} ${puladas === 1 ? "ficou" : "ficaram"} de fora porque o responsável é outra pessoa.`;
}

export function mailtoDaIntimacao(dados: {
  numeroProcesso: string | null;
  tribunal: string | null;
  publicadaEm: string | null;
  texto: string;
}) {
  const cnj = normalizarCnj(dados.numeroProcesso);
  const processo = cnj ? formatarCnj(cnj) : "processo sem número";
  const assunto = `Intimação · ${processo}`;
  const corpo = [
    `Processo: ${processo}`,
    dados.tribunal ? `Tribunal: ${dados.tribunal}` : null,
    dados.publicadaEm ? `Publicada em: ${dados.publicadaEm}` : null,
    "",
    dados.texto.slice(0, 1500),
  ]
    .filter((linha) => linha !== null)
    .join("\n");
  return `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

export function termoDeBuscaDeProcesso(entrada: string) {
  const texto = entrada.trim().slice(0, 80);
  const cnj = normalizarCnj(texto);
  if (cnj) return { tipo: "cnj" as const, valor: formatarCnj(cnj) };
  const limpo = texto
    .replace(/[,()%*\\"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return limpo.length >= 3 ? { tipo: "texto" as const, valor: limpo } : null;
}
