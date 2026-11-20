import { z } from "zod";
import { chamarEtapa, type ResultadoEtapa } from "../analise/chamada.js";
import type { ClienteIa } from "../cliente.js";
import { INSTRUCOES_CLASSIFICAR, VERSAO_CLASSIFICAR } from "../prompts/classificar.js";

export type OpcaoTipoPeca = { id: string; nome: string; area: string };

const TRECHO_MAXIMO = 6000;

export async function classificarTipoPeca(
  cliente: ClienteIa,
  texto: string,
  opcoes: OpcaoTipoPeca[],
): Promise<ResultadoEtapa<string | null>> {
  const [primeiro, ...resto] = opcoes.map(({ id }) => id);
  if (!primeiro) throw new Error("Nenhum tipo de peça para escolher");
  const etapa = await chamarEtapa(cliente, {
    schema: z.object({ id: z.enum([primeiro, ...resto, "outro"]) }),
    sistema: INSTRUCOES_CLASSIFICAR,
    conteudo: `<peca>\n${texto.slice(0, TRECHO_MAXIMO)}\n</peca>\n<tipos>\n${JSON.stringify(opcoes)}\n</tipos>`,
    versaoPrompt: VERSAO_CLASSIFICAR,
    esforco: "low",
  });
  return { ...etapa, resultado: etapa.resultado.id === "outro" ? null : etapa.resultado.id };
}
