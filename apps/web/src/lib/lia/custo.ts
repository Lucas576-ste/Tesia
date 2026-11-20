import type { UsoModelo } from "./responder";

const PRECO_HAIKU_POR_MILHAO = {
  entrada: 0.1,
  saida: 0.5,
  cacheLeitura: 0.01,
  cacheEscrita: 0.125,
};

export function custoDaResposta(uso: UsoModelo) {
  const cacheLeitura = uso.cache_read_input_tokens ?? 0;
  const cacheEscrita = uso.cache_creation_input_tokens ?? 0;
  const preco = PRECO_HAIKU_POR_MILHAO;
  const custo =
    (uso.input_tokens * preco.entrada +
      uso.output_tokens * preco.saida +
      cacheLeitura * preco.cacheLeitura +
      cacheEscrita * preco.cacheEscrita) /
    1_000_000;
  return {
    tokensEntrada: uso.input_tokens,
    tokensCache: cacheLeitura,
    tokensSaida: uso.output_tokens,
    custoEstimado: Math.round(custo * 1_000_000) / 1_000_000,
  };
}

export async function registrarUsoLia(
  escritorioId: string,
  uso: UsoModelo,
  modelo: string,
  versaoPrompt: string,
  duracaoMs: number,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const segredo = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !segredo) return;
  const custo = custoDaResposta(uso);
  try {
    await fetch(`${url}/rest/v1/uso_ia`, {
      method: "POST",
      headers: {
        apikey: segredo,
        Authorization: `Bearer ${segredo}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        escritorio_id: escritorioId,
        etapa: "chat_lia",
        modelo,
        versao_prompt: versaoPrompt,
        tokens_entrada: custo.tokensEntrada,
        tokens_cache: custo.tokensCache,
        tokens_saida: custo.tokensSaida,
        custo_estimado: custo.custoEstimado,
        duracao_ms: duracaoMs,
      }),
      cache: "no-store",
    });
  } catch {
    return;
  }
}
