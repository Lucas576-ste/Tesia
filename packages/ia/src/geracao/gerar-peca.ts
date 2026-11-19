import type { PerfilEstilo } from "@tesia/shared";
import type { ClienteIa } from "../cliente.js";
import { calcularCusto, type UsoIa } from "../custo.js";
import { MODELOS } from "../modelos.js";
import { INSTRUCOES_GERACAO, VERSAO_GERACAO } from "../prompts/geracao.js";
import { RespostaInvalidaDaIa } from "../transcricao.js";
import { acharPendencias, separarSecoes, type Pendencia, type SecaoPeca } from "./secoes.js";

export type TrechoReferencia = { documento: string; secao: string; texto: string };

export type EntradaGeracao = {
  peca: { nome: string; estrutura: string[]; instrucoes: string | null };
  perfil: PerfilEstilo | null;
  trechos: TrechoReferencia[];
  dados: Record<string, unknown>;
  textoIntimacao: string;
  pontosAtacar: { titulo: string; explicacao?: string }[];
  prazo: { vencimento: string; fundamento: string } | null;
  qualificacaoCliente?: string | null;
};

export type ResultadoGeracao = {
  secoes: SecaoPeca[];
  pendencias: Pendencia[];
  uso: UsoIa;
  versaoPrompt: string;
  duracaoMs: number;
};

function textoPerfil(perfil: PerfilEstilo | null) {
  if (!perfil) {
    return "Perfil de estilo: ainda não disponível. Escreva de forma técnica, clara e direta, no padrão forense brasileiro.";
  }
  return `Perfil de estilo do advogado:\n${JSON.stringify(perfil, null, 2)}`;
}

function textoTipoPeca({ nome, estrutura, instrucoes }: EntradaGeracao["peca"]) {
  return [
    `Peça a escrever: ${nome}.`,
    `Ordem das seções (códigos internos, não são títulos): ${estrutura.join(", ")}.`,
    instrucoes ? `Instruções deste tipo de peça: ${instrucoes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function montarPedidoGeracao(entrada: EntradaGeracao) {
  const sistema = [
    {
      type: "text" as const,
      text: INSTRUCOES_GERACAO,
      cache_control: { type: "ephemeral" as const },
    },
    {
      type: "text" as const,
      text: textoPerfil(entrada.perfil),
      cache_control: { type: "ephemeral" as const },
    },
    {
      type: "text" as const,
      text: textoTipoPeca(entrada.peca),
      cache_control: { type: "ephemeral" as const },
    },
  ];
  const trechos = entrada.trechos.length
    ? entrada.trechos
        .map(
          (t, i) =>
            `<trecho numero="${i + 1}" peca="${t.documento}" secao="${t.secao}">\n${t.texto}\n</trecho>`,
        )
        .join("\n")
    : "Nenhum trecho de peça antiga disponível.";
  const pontos = entrada.pontosAtacar.length
    ? entrada.pontosAtacar
        .map((p) => `- ${p.titulo}${p.explicacao ? `: ${p.explicacao}` : ""}`)
        .join("\n")
    : "- Nenhum ponto específico; desenvolva a tese cabível a partir da decisão.";
  const prazo = entrada.prazo
    ? `Prazo confirmado: vence em ${entrada.prazo.vencimento} (${entrada.prazo.fundamento}).`
    : "Prazo: confirmado pelo advogado.";
  const conteudo = [
    `<trechos_do_advogado>\n${trechos}\n</trechos_do_advogado>`,
    `<dados_do_caso>\n${JSON.stringify(entrada.dados)}\n</dados_do_caso>`,
    `<documento_do_caso>\n${entrada.textoIntimacao}\n</documento_do_caso>`,
    `<pontos_a_atacar>\n${pontos}\n</pontos_a_atacar>`,
    prazo,
    entrada.qualificacaoCliente
      ? `<qualificacao_cliente>\n${entrada.qualificacaoCliente}\n</qualificacao_cliente>`
      : "",
    `Escreva agora a ${entrada.peca.nome} completa.`,
  ]
    .filter(Boolean)
    .join("\n\n");
  return { sistema, conteudo };
}

export async function gerarPeca(
  cliente: ClienteIa,
  entrada: EntradaGeracao,
): Promise<ResultadoGeracao> {
  const inicio = Date.now();
  const modelo = MODELOS.sonnet;
  const { sistema, conteudo } = montarPedidoGeracao(entrada);
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
    throw new RespostaInvalidaDaIa("A IA recusou escrever a peça");
  if (resposta.stop_reason === "max_tokens")
    throw new RespostaInvalidaDaIa("A peça ficou longa demais e foi cortada");

  const texto = resposta.content
    .flatMap((bloco) => (bloco.type === "text" ? [bloco.text] : []))
    .join("");
  const secoes = separarSecoes(texto);
  if (secoes.length < 2)
    throw new RespostaInvalidaDaIa("A peça não veio no formato de seções esperado");

  return {
    secoes,
    pendencias: acharPendencias(secoes),
    uso: calcularCusto(modelo, resposta.usage),
    versaoPrompt: VERSAO_GERACAO,
    duracaoMs: Date.now() - inicio,
  };
}
