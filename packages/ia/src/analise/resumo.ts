import { z } from "zod";
import type { ClienteIa } from "../cliente.js";
import { INSTRUCOES_RESUMO, VERSAO_RESUMO } from "../prompts/resumo.js";
import { chamarEtapa, type ResultadoEtapa } from "./chamada.js";
import type { Extracao } from "./extracao.js";
import { manterComTrecho } from "./trechos.js";

export const resumoSchema = z.object({
  o_que_aconteceu: z.string(),
  pontos_ataque: z.array(
    z.object({ titulo: z.string(), explicacao: z.string(), trecho: z.string() }),
  ),
});

export type Resumo = z.infer<typeof resumoSchema>;

export const MAXIMO_FRASES_RESUMO = 4;

export function limitarFrases(texto: string, maximo = MAXIMO_FRASES_RESUMO) {
  return texto
    .trim()
    .split(/(?<=[.!?])\s+(?=["“(]?[A-ZÀ-Ý])/u)
    .slice(0, maximo)
    .join(" ");
}

export async function resumirIntimacao(
  cliente: ClienteIa,
  texto: string,
  extracao: Extracao,
): Promise<ResultadoEtapa<Resumo>> {
  const dados = { ...extracao, pontos: undefined };
  const etapa = await chamarEtapa(cliente, {
    schema: resumoSchema,
    sistema: INSTRUCOES_RESUMO,
    conteudo: `<dados_extraidos>\n${JSON.stringify(dados)}\n</dados_extraidos>\n<documento>\n${texto}\n</documento>`,
    versaoPrompt: VERSAO_RESUMO,
    esforco: "medium",
  });
  return {
    ...etapa,
    resultado: {
      o_que_aconteceu: limitarFrases(etapa.resultado.o_que_aconteceu),
      pontos_ataque: manterComTrecho(etapa.resultado.pontos_ataque, texto),
    },
  };
}
