import { z } from "zod";
import { chamarEtapa, type ResultadoEtapa } from "../analise/chamada.js";
import type { ClienteIa } from "../cliente.js";
import { INSTRUCOES_REVISAO, VERSAO_REVISAO } from "../prompts/revisao.js";
import type { TrechoReferencia } from "./gerar-peca.js";
import type { SecaoPeca } from "./secoes.js";

const revisaoSchema = z.object({
  problemas: z.array(z.object({ trecho_exato: z.string(), motivo: z.string() })),
});

export type ProblemaCitacao = z.infer<typeof revisaoSchema>["problemas"][number];

const JA_MARCADO = /^\s*\[CONFIRMAR/;

function posicaoDoTrecho(texto: string, trecho: string) {
  const exata = texto.indexOf(trecho);
  if (exata >= 0) return { inicio: exata, fim: exata + trecho.length };
  const partes = trecho
    .trim()
    .split(/\s+/)
    .map((parte) => parte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (partes.length === 0) return null;
  const achado = new RegExp(partes.join("\\s+")).exec(texto);
  return achado ? { inicio: achado.index, fim: achado.index + achado[0].length } : null;
}

export function marcarProblemas(secoes: SecaoPeca[], problemas: ProblemaCitacao[]) {
  let inseridos = 0;
  const resultado = secoes.map((secao) => ({ ...secao }));
  for (const { trecho_exato, motivo } of problemas) {
    const trecho = trecho_exato.trim();
    if (trecho.length < 8 || /\[CONFIRMAR/.test(trecho)) continue;
    for (const secao of resultado) {
      const posicao = posicaoDoTrecho(secao.texto, trecho);
      if (!posicao) continue;
      if (!JA_MARCADO.test(secao.texto.slice(posicao.fim))) {
        const marcador = ` [CONFIRMAR: ${motivo.trim().replace(/[[\]]/g, "") || "conferir este ponto"}]`;
        secao.texto = secao.texto.slice(0, posicao.fim) + marcador + secao.texto.slice(posicao.fim);
        inseridos += 1;
      }
      break;
    }
  }
  return { secoes: resultado, inseridos };
}

export async function revisarCitacoes(
  cliente: ClienteIa,
  entrada: { secoes: SecaoPeca[]; textoIntimacao: string; trechos: TrechoReferencia[] },
): Promise<ResultadoEtapa<ProblemaCitacao[]>> {
  const rascunho = entrada.secoes.map((s) => `${s.titulo}\n${s.texto}`.trim()).join("\n\n");
  const trechos = entrada.trechos.map((t) => t.texto).join("\n---\n") || "Nenhum.";
  const etapa = await chamarEtapa(cliente, {
    schema: revisaoSchema,
    sistema: INSTRUCOES_REVISAO,
    conteudo: `<documento_do_caso>\n${entrada.textoIntimacao}\n</documento_do_caso>\n<pecas_do_advogado>\n${trechos}\n</pecas_do_advogado>\n<rascunho>\n${rascunho}\n</rascunho>`,
    versaoPrompt: VERSAO_REVISAO,
    esforco: "low",
  });
  return { ...etapa, resultado: etapa.resultado.problemas };
}
