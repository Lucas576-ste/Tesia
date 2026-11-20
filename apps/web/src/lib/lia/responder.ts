import { perguntaJuridicaAberta, RESPOSTA_JURIDICA } from "./porteiro";

export const MENSAGEM_ERRO = "Não consegui responder agora. Tente de novo.";
export const MODELO_LIA = "claude-haiku-5-5";
export const MAXIMO_TOKENS_RESPOSTA = 700;

export type Decisao =
  { tipo: "limite" } | { tipo: "juridica"; resposta: string } | { tipo: "modelo" };

type EntradaDecisao = { mensagem: string; usadas: number; limite: number; reenvio: boolean };

export function decidirPergunta({ mensagem, usadas, limite, reenvio }: EntradaDecisao): Decisao {
  if (!reenvio && usadas >= limite) return { tipo: "limite" };
  if (perguntaJuridicaAberta(mensagem)) return { tipo: "juridica", resposta: RESPOSTA_JURIDICA };
  return { tipo: "modelo" };
}

export type UsoModelo = {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};

type EventoModelo = { type: string; delta?: { type: string; text?: string } };

type FluxoModelo = AsyncIterable<EventoModelo> & {
  finalMessage(): Promise<{ usage: UsoModelo }>;
  abort(): void;
};

export type ClienteChat = {
  messages: { stream(corpo: never, opcoes?: { signal?: AbortSignal }): FluxoModelo };
};

export type Turno = { role: "user" | "assistant"; content: string };

type PedidoResposta = {
  sistema: unknown;
  mensagens: Turno[];
  signal?: AbortSignal;
};

export type ResultadoResposta = {
  texto: string;
  uso: UsoModelo | null;
  interrompida: boolean;
  falhou: boolean;
};

export async function gerarResposta(
  cliente: ClienteChat,
  { sistema, mensagens, signal }: PedidoResposta,
  aoTexto: (pedaco: string) => void,
): Promise<ResultadoResposta> {
  let texto = "";
  try {
    const fluxo = cliente.messages.stream(
      {
        model: MODELO_LIA,
        max_tokens: MAXIMO_TOKENS_RESPOSTA,
        system: sistema,
        messages: mensagens,
      } as never,
      { signal },
    );
    for await (const evento of fluxo) {
      if (evento.type === "content_block_delta" && evento.delta?.type === "text_delta") {
        const pedaco = evento.delta.text ?? "";
        texto += pedaco;
        aoTexto(pedaco);
      }
    }
    const final = await fluxo.finalMessage();
    return { texto, uso: final.usage, interrompida: false, falhou: false };
  } catch {
    const interrompida = Boolean(signal?.aborted);
    return { texto, uso: null, interrompida, falhou: !interrompida };
  }
}

export function turnosParaModelo(historico: { papel: string; conteudo: string }[]): Turno[] {
  const turnos: Turno[] = [];
  for (const { papel, conteudo } of historico) {
    const role = papel === "usuario" ? "user" : "assistant";
    if (turnos.at(-1)?.role === role) turnos.pop();
    turnos.push({ role, content: conteudo });
  }
  while (turnos[0]?.role === "assistant") turnos.shift();
  return turnos;
}
