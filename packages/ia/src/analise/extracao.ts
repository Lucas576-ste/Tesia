import { z } from "zod";
import type { ClienteIa } from "../cliente.js";
import { INSTRUCOES_EXTRACAO, VERSAO_EXTRACAO } from "../prompts/extracao.js";
import { chamarEtapa, type ResultadoEtapa } from "./chamada.js";
import { AREAS, FORMAS_INTIMACAO, POLOS, RITOS, TIPOS_ATO } from "./listas.js";
import { manterComTrecho } from "./trechos.js";

export const extracaoSchema = z.object({
  numero_processo: z.string().nullable(),
  tribunal: z.string().nullable(),
  orgao: z.string().nullable(),
  uf: z.string().nullable(),
  municipio: z.string().nullable(),
  partes: z.array(z.object({ nome: z.string(), polo: z.enum(POLOS).nullable() })),
  polo_cliente: z.enum(POLOS).nullable(),
  area: z.enum(AREAS).nullable(),
  rito: z.enum(RITOS),
  tipo_ato: z.enum(TIPOS_ATO),
  forma_intimacao: z.enum(FORMAS_INTIMACAO),
  data_disponibilizacao: z.string().nullable(),
  data_envio_portal: z.string().nullable(),
  resultado: z.string().nullable(),
  pontos: z.array(z.object({ titulo: z.string(), trecho: z.string() })),
});

export type Extracao = z.infer<typeof extracaoSchema>;

function dataValida(data: string | null) {
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
  const convertida = new Date(`${data}T00:00:00Z`);
  return convertida.toISOString().startsWith(data) ? data : null;
}

export async function extrairDados(
  cliente: ClienteIa,
  texto: string,
): Promise<ResultadoEtapa<Extracao>> {
  const etapa = await chamarEtapa(cliente, {
    schema: extracaoSchema,
    sistema: INSTRUCOES_EXTRACAO,
    conteudo: `<documento>\n${texto}\n</documento>`,
    versaoPrompt: VERSAO_EXTRACAO,
    esforco: "low",
  });
  return {
    ...etapa,
    resultado: {
      ...etapa.resultado,
      uf: etapa.resultado.uf?.toUpperCase().slice(0, 2) ?? null,
      data_disponibilizacao: dataValida(etapa.resultado.data_disponibilizacao),
      data_envio_portal: dataValida(etapa.resultado.data_envio_portal),
      pontos: manterComTrecho(etapa.resultado.pontos, texto),
    },
  };
}
