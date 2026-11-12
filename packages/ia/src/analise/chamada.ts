import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import type { ClienteIa } from "../cliente.js";
import { calcularCusto, type UsoIa } from "../custo.js";
import { MODELOS } from "../modelos.js";
import { RespostaInvalidaDaIa } from "../transcricao.js";

export type ResultadoEtapa<T> = {
  resultado: T;
  uso: UsoIa;
  versaoPrompt: string;
  duracaoMs: number;
};

export type PedidoEtapa<S extends z.ZodType> = {
  schema: S;
  sistema: string;
  conteudo: string;
  versaoPrompt: string;
  esforco: "low" | "medium";
};

export async function chamarEtapa<S extends z.ZodType>(
  cliente: ClienteIa,
  { schema, sistema, conteudo, versaoPrompt, esforco }: PedidoEtapa<S>,
): Promise<ResultadoEtapa<z.infer<S>>> {
  const inicio = Date.now();
  const modelo = MODELOS.haiku;
  const resposta = await cliente.messages.parse({
    model: modelo,
    max_tokens: 16000,
    system: sistema,
    output_config: { effort: esforco, format: zodOutputFormat(schema) },
    messages: [{ role: "user", content: conteudo }],
  });

  if (resposta.stop_reason === "refusal")
    throw new RespostaInvalidaDaIa("A IA recusou o documento");
  if (resposta.stop_reason === "max_tokens")
    throw new RespostaInvalidaDaIa("A resposta da IA foi cortada");
  if (resposta.parsed_output === null)
    throw new RespostaInvalidaDaIa("A IA não devolveu o formato esperado");

  return {
    resultado: resposta.parsed_output,
    uso: calcularCusto(modelo, resposta.usage),
    versaoPrompt,
    duracaoMs: Date.now() - inicio,
  };
}
