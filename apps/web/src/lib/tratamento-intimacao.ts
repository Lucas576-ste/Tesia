import { formatarCnj, normalizarCnj } from "@tesia/shared";

export type SituacaoTratamento = "pendente" | "concluida" | "ignorada";

export function podeTratarIntimacao(responsavelId: string | null, usuarioId: string) {
  return responsavelId === null || responsavelId === usuarioId;
}

export function resumoDoLote(feitas: number, puladas: number, verbo: string, prazosMantidos = 0) {
  const alvo = (n: number) => (n === 1 ? "1 intimação" : `${n} intimações`);
  if (feitas === 0) return `Nenhuma intimação ${verbo}: só o responsável trata cada uma.`;
  const prazos =
    prazosMantidos === 0
      ? ""
      : prazosMantidos === 1
        ? " 1 prazo confirmado continua no painel."
        : ` ${prazosMantidos} prazos confirmados continuam no painel.`;
  if (puladas === 0) return `${alvo(feitas)} ${verbo}.${prazos}`;
  return `${alvo(feitas)} ${verbo}. ${alvo(puladas)} ${puladas === 1 ? "ficou" : "ficaram"} de fora porque o responsável é outra pessoa.${prazos}`;
}

export function rotuloDaData(fonte: "diario" | "eletronico" | null) {
  return fonte === "eletronico" ? "Enviada em" : "Disponibilizada em";
}

export function mailtoDaIntimacao(dados: {
  numeroProcesso: string | null;
  tribunal: string | null;
  publicadaEm: string | null;
  fonte: "diario" | "eletronico" | null;
  texto: string;
}) {
  const cnj = normalizarCnj(dados.numeroProcesso);
  const processo = cnj ? formatarCnj(cnj) : "processo sem número";
  const assunto = `Intimação · ${processo}`;
  const corpo = [
    `Processo: ${processo}`,
    dados.tribunal ? `Tribunal: ${dados.tribunal}` : null,
    dados.publicadaEm ? `${rotuloDaData(dados.fonte)}: ${dados.publicadaEm}` : null,
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
