import { z } from "zod";
import type { ClienteIa } from "../cliente.js";
import { INSTRUCOES_ESCOLHA_PECA, VERSAO_ESCOLHA_PECA } from "../prompts/escolha-peca.js";
import { chamarEtapa, type ResultadoEtapa } from "./chamada.js";
import type { Extracao } from "./extracao.js";

export type OpcaoPeca = {
  codigo: string;
  nome: string;
  fundamento?: string;
  dias?: number;
};

export type EscolhaPeca = {
  recomendada: { codigo: string; justificativa: string };
  alternativas: { codigo: string; justificativa: string }[];
};

export function schemaEscolha(codigos: [string, ...string[]]) {
  const item = z.object({ codigo: z.enum(codigos), justificativa: z.string() });
  return z.object({ recomendada: item, alternativas: z.array(item) });
}

export async function escolherPeca(
  cliente: ClienteIa,
  extracao: Pick<Extracao, "area" | "rito" | "tipo_ato" | "resultado" | "polo_cliente">,
  opcoes: OpcaoPeca[],
): Promise<ResultadoEtapa<EscolhaPeca>> {
  const codigos = [...new Set(opcoes.map((opcao) => opcao.codigo))];
  const [primeiro, ...resto] = codigos;
  if (!primeiro) throw new Error("Nenhuma peça possível para escolher");

  const situacao = {
    area: extracao.area,
    rito: extracao.rito,
    tipo_ato: extracao.tipo_ato,
    resultado: extracao.resultado,
    polo_cliente: extracao.polo_cliente,
  };
  const etapa = await chamarEtapa(cliente, {
    schema: schemaEscolha([primeiro, ...resto]),
    sistema: INSTRUCOES_ESCOLHA_PECA,
    conteudo: `<situacao>\n${JSON.stringify(situacao)}\n</situacao>\n<opcoes>\n${JSON.stringify(opcoes)}\n</opcoes>`,
    versaoPrompt: VERSAO_ESCOLHA_PECA,
    esforco: "medium",
  });
  const { recomendada, alternativas } = etapa.resultado;
  const vistas = new Set([recomendada.codigo]);
  return {
    ...etapa,
    resultado: {
      recomendada,
      alternativas: alternativas.filter((alternativa) => {
        if (vistas.has(alternativa.codigo)) return false;
        vistas.add(alternativa.codigo);
        return true;
      }),
    },
  };
}
