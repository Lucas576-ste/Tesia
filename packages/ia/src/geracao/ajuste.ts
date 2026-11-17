import type { PerfilEstilo } from "@tesia/shared";
import type { ClienteIa } from "../cliente.js";
import { calcularCusto, type UsoIa } from "../custo.js";
import { MODELOS } from "../modelos.js";
import { INSTRUCOES_AJUSTE, VERSAO_AJUSTE } from "../prompts/ajuste.js";
import { RespostaInvalidaDaIa } from "../transcricao.js";
import type { SecaoPeca } from "./secoes.js";

const SECAO_INDICE = /<secao\s+indice="(\d+)"\s+titulo="([^"]*)"\s*>([\s\S]*?)<\/secao>/g;

export type SecaoAlterada = { indice: number; titulo: string; texto: string };

export function separarSecoesAlteradas(resposta: string): SecaoAlterada[] {
  return [...resposta.matchAll(SECAO_INDICE)].map(([, indice, titulo, texto]) => ({
    indice: Number(indice),
    titulo: (titulo ?? "").trim(),
    texto: (texto ?? "").trim(),
  }));
}

export function juntarSecoes(originais: SecaoPeca[], alteradas: SecaoAlterada[]): SecaoPeca[] {
  const resultado = originais.map((secao) => ({ ...secao }));
  for (const { indice, titulo, texto } of [...alteradas].sort((a, b) => a.indice - b.indice)) {
    if (!texto) continue;
    if (indice < resultado.length) resultado[indice] = { titulo, texto };
    else resultado.push({ titulo, texto });
  }
  return resultado;
}

export type ResultadoAjuste = {
  secoes: SecaoPeca[];
  alteradas: number;
  uso: UsoIa;
  versaoPrompt: string;
  duracaoMs: number;
};

export function montarPedidoAjuste(
  secoes: SecaoPeca[],
  pedido: string,
  perfil: PerfilEstilo | null,
) {
  const sistema = [
    {
      type: "text" as const,
      text: INSTRUCOES_AJUSTE,
      cache_control: { type: "ephemeral" as const },
    },
    {
      type: "text" as const,
      text: perfil
        ? `Perfil de estilo do advogado:\n${JSON.stringify(perfil, null, 2)}`
        : "Perfil de estilo: não disponível.",
      cache_control: { type: "ephemeral" as const },
    },
  ];
  const peca = secoes
    .map(
      (secao, indice) =>
        `<secao indice="${indice}" titulo="${secao.titulo}">\n${secao.texto}\n</secao>`,
    )
    .join("\n");
  const conteudo = `<peca_atual>\n${peca}\n</peca_atual>\n\n<pedido_do_advogado>\n${pedido}\n</pedido_do_advogado>`;
  return { sistema, conteudo };
}

export async function ajustarPeca(
  cliente: ClienteIa,
  entrada: { secoes: SecaoPeca[]; pedido: string; perfil: PerfilEstilo | null },
): Promise<ResultadoAjuste> {
  const inicio = Date.now();
  const modelo = MODELOS.sonnet;
  const { sistema, conteudo } = montarPedidoAjuste(entrada.secoes, entrada.pedido, entrada.perfil);
  const resposta = await cliente.beta.messages
    .stream({
      model: modelo,
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: sistema,
      messages: [{ role: "user", content: conteudo }],
    })
    .finalMessage();

  if (resposta.stop_reason === "refusal")
    throw new RespostaInvalidaDaIa("A IA recusou o ajuste pedido");
  if (resposta.stop_reason === "max_tokens")
    throw new RespostaInvalidaDaIa("O ajuste ficou longo demais e foi cortado");

  const texto = resposta.content
    .flatMap((bloco) => (bloco.type === "text" ? [bloco.text] : []))
    .join("");
  const alteradas = separarSecoesAlteradas(texto).filter((secao) => secao.texto);
  if (alteradas.length === 0)
    throw new RespostaInvalidaDaIa("A IA não devolveu nenhuma seção ajustada");

  return {
    secoes: juntarSecoes(entrada.secoes, alteradas),
    alteradas: alteradas.length,
    uso: calcularCusto(modelo, resposta.usage),
    versaoPrompt: VERSAO_AJUSTE,
    duracaoMs: Date.now() - inicio,
  };
}
