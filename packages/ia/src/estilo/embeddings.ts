import { z } from "zod";

export const MODELO_EMBEDDINGS = "voyage-law-2";
export const DIMENSOES_EMBEDDING = 1024;
export const PRECO_EMBEDDINGS_POR_MILHAO = 0.12;
const URL_VOYAGE = "https://api.voyageai.com/v1/embeddings";
const TAMANHO_LOTE = 64;

export class ErroEmbeddingsDefinitivo extends Error {}

const respostaSchema = z.object({
  data: z.array(z.object({ embedding: z.array(z.number()), index: z.number().int() })),
  usage: z.object({ total_tokens: z.number().int() }),
});

export type ResultadoEmbeddings = {
  vetores: number[][];
  tokens: number;
  custoEstimado: number;
  modelo: typeof MODELO_EMBEDDINGS;
  duracaoMs: number;
};

export type OpcoesEmbeddings = {
  chave: string;
  tipo: "document" | "query";
  buscar?: typeof fetch;
};

async function gerarLote(textos: string[], { chave, tipo, buscar = fetch }: OpcoesEmbeddings) {
  const resposta = await buscar(URL_VOYAGE, {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({ input: textos, model: MODELO_EMBEDDINGS, input_type: tipo }),
  });
  if (!resposta.ok) {
    const mensagem = `Voyage respondeu ${resposta.status}`;
    if (resposta.status >= 400 && resposta.status < 500 && resposta.status !== 429)
      throw new ErroEmbeddingsDefinitivo(mensagem);
    throw new Error(mensagem);
  }
  const dados = respostaSchema.parse(await resposta.json());
  const vetores = [...dados.data].sort((a, b) => a.index - b.index).map((item) => item.embedding);
  if (vetores.some((vetor) => vetor.length !== DIMENSOES_EMBEDDING))
    throw new ErroEmbeddingsDefinitivo("Embedding com dimensão inesperada");
  return { vetores, tokens: dados.usage.total_tokens };
}

export async function gerarEmbeddings(
  textos: string[],
  opcoes: OpcoesEmbeddings,
): Promise<ResultadoEmbeddings> {
  const inicio = Date.now();
  const vetores: number[][] = [];
  let tokens = 0;
  for (let indice = 0; indice < textos.length; indice += TAMANHO_LOTE) {
    const lote = await gerarLote(textos.slice(indice, indice + TAMANHO_LOTE), opcoes);
    vetores.push(...lote.vetores);
    tokens += lote.tokens;
  }
  return {
    vetores,
    tokens,
    custoEstimado: Math.round(tokens * PRECO_EMBEDDINGS_POR_MILHAO) / 1_000_000,
    modelo: MODELO_EMBEDDINGS,
    duracaoMs: Date.now() - inicio,
  };
}

export function vetorParaPgvector(vetor: number[]) {
  return `[${vetor.join(",")}]`;
}
