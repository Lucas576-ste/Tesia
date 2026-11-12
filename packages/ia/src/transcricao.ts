import type { ClienteIa } from "./cliente.js";
import { calcularCusto, type UsoIa } from "./custo.js";
import { MODELOS } from "./modelos.js";
import { INSTRUCOES_TRANSCRICAO, VERSAO_TRANSCRICAO } from "./prompts/transcricao.js";

export class RespostaInvalidaDaIa extends Error {}

export type Transcricao = {
  texto: string;
  uso: UsoIa;
  versaoPrompt: string;
  duracaoMs: number;
};

export async function transcreverPdf(cliente: ClienteIa, pdf: Uint8Array): Promise<Transcricao> {
  const inicio = Date.now();
  const modelo = MODELOS.haiku;
  const resposta = await cliente.messages
    .stream({
      model: modelo,
      max_tokens: 64000,
      output_config: { effort: "low" },
      system: INSTRUCOES_TRANSCRICAO,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: Buffer.from(pdf).toString("base64"),
              },
            },
            { type: "text", text: "Transcreva este documento." },
          ],
        },
      ],
    })
    .finalMessage();

  if (resposta.stop_reason === "refusal")
    throw new RespostaInvalidaDaIa("A IA recusou o documento");
  if (resposta.stop_reason === "max_tokens")
    throw new RespostaInvalidaDaIa("O documento é longo demais para transcrever");

  const texto = resposta.content
    .flatMap((bloco) => (bloco.type === "text" ? [bloco.text] : []))
    .join("")
    .trim();

  return {
    texto,
    uso: calcularCusto(modelo, resposta.usage),
    versaoPrompt: VERSAO_TRANSCRICAO,
    duracaoMs: Date.now() - inicio,
  };
}
