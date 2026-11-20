import { z } from "zod";
import type { PerfilGravado } from "@tesia/shared";
import { chamarEtapa, type ResultadoEtapa } from "../analise/chamada.js";
import type { ClienteIa } from "../cliente.js";
import { INSTRUCOES_EXEMPLO, VERSAO_EXEMPLO } from "../prompts/exemplo.js";

const exemploSchema = z.object({ paragrafo: z.string().min(40) });

export async function gerarExemploEstilo(
  cliente: ClienteIa,
  perfil: PerfilGravado,
  { tipo, anterior }: { tipo: string; anterior?: string },
): Promise<ResultadoEtapa<string>> {
  const estilo = {
    tom: perfil.tom,
    tamanho_frases: perfil.tamanho_frases,
    citacao_lei: perfil.citacao_lei,
    citacao_jurisprudencia: perfil.citacao_jurisprudencia,
    abertura: perfil.abertura,
    fechamento: perfil.fechamento,
    expressoes_tipicas: perfil.expressoes_tipicas,
    estrutura_por_tipo: perfil.estrutura_por_tipo,
  };
  const partes = [
    `<tipo_de_peca>${tipo}</tipo_de_peca>`,
    `<perfil>\n${JSON.stringify(estilo)}\n</perfil>`,
  ];
  if (anterior) partes.push(`<anterior>\n${anterior}\n</anterior>`);
  const etapa = await chamarEtapa(cliente, {
    schema: exemploSchema,
    sistema: INSTRUCOES_EXEMPLO,
    conteudo: partes.join("\n"),
    versaoPrompt: VERSAO_EXEMPLO,
    esforco: "low",
  });
  return { ...etapa, resultado: etapa.resultado.paragrafo.trim() };
}
