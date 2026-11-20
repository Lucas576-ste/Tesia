import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { perfilEstiloSchema, type PerfilEstilo } from "@tesia/shared";
import type { ClienteIa } from "../cliente.js";
import { calcularCusto, type UsoIa } from "../custo.js";
import { MODELOS } from "../modelos.js";
import { INSTRUCOES_PERFIL, VERSAO_PERFIL } from "../prompts/perfil.js";
import { RespostaInvalidaDaIa } from "../transcricao.js";

export { perfilEstiloSchema, type PerfilEstilo };

export type PecaParaPerfil = { nome: string; texto: string };

export type ResultadoPerfil = {
  perfil: PerfilEstilo;
  uso: UsoIa;
  versaoPrompt: string;
  duracaoMs: number;
};

export const MINIMO_FRASES_EXIBICAO = 4;
export const MAXIMO_FRASES_EXIBICAO = 6;

export type CorrecaoEstilo = {
  parte: string;
  texto_item: string;
  avaliacao: "certo" | "errado";
  correcao: string | null;
};

export function montarConteudoPerfil(pecas: PecaParaPerfil[], correcoes: CorrecaoEstilo[] = []) {
  const texto = pecas
    .map(
      (peca, indice) =>
        `<peca numero="${indice + 1}" arquivo="${peca.nome}">\n${peca.texto}\n</peca>`,
    )
    .join("\n\n");
  if (correcoes.length === 0) return texto;
  const bloco = correcoes.map(({ parte, texto_item, avaliacao, correcao }) => ({
    parte,
    item: texto_item,
    avaliacao,
    como_faz: correcao,
  }));
  return `${texto}\n\n<correcoes>\n${JSON.stringify(bloco)}\n</correcoes>`;
}

export async function gerarPerfilEstilo(
  cliente: ClienteIa,
  pecas: PecaParaPerfil[],
  correcoes: CorrecaoEstilo[] = [],
): Promise<ResultadoPerfil> {
  if (pecas.length === 0) throw new Error("Nenhuma peça para gerar o perfil");
  const inicio = Date.now();
  const modelo = MODELOS.sonnet;
  const resposta = await cliente.beta.messages.parse({
    model: modelo,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: INSTRUCOES_PERFIL,
    output_config: { effort: "medium", format: betaZodOutputFormat(perfilEstiloSchema) },
    messages: [{ role: "user", content: montarConteudoPerfil(pecas, correcoes) }],
  });

  if (resposta.stop_reason === "refusal") throw new RespostaInvalidaDaIa("A IA recusou as peças");
  if (resposta.stop_reason === "max_tokens")
    throw new RespostaInvalidaDaIa("O perfil de estilo foi cortado");
  if (!resposta.parsed_output)
    throw new RespostaInvalidaDaIa("A IA não devolveu o perfil esperado");

  const perfil = resposta.parsed_output;
  const frases = perfil.frases_exibicao.map((frase) => frase.trim()).filter(Boolean);
  if (frases.length < MINIMO_FRASES_EXIBICAO)
    throw new RespostaInvalidaDaIa("O perfil veio com poucas frases para mostrar");

  return {
    perfil: {
      ...perfil,
      aprendizados: perfil.aprendizados
        .map((grupo) => ({
          ...grupo,
          itens: grupo.itens.map((item) => item.trim()).filter(Boolean),
        }))
        .filter((grupo) => grupo.itens.length > 0),
      frases_exibicao: frases.slice(0, MAXIMO_FRASES_EXIBICAO),
    },
    uso: calcularCusto(modelo, resposta.usage),
    versaoPrompt: VERSAO_PERFIL,
    duracaoMs: Date.now() - inicio,
  };
}
