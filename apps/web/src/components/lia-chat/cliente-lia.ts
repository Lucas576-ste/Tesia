import { decodificarEventos, type EventoLia } from "@/lib/lia/eventos";
import { MENSAGEM_ERRO } from "@/lib/lia/responder";

export type PedidoLia = {
  conversaId?: string;
  mensagem: string;
  rota: string;
  reenvio?: boolean;
};

export type ResultadoEnvio =
  | { tipo: "ok" }
  | { tipo: "limite"; mensagem: string; uso: { usadas: number; limite: number } | null }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "interrompido" };

type EntradaEnvio = {
  pedido: PedidoLia;
  signal: AbortSignal;
  aoEvento: (evento: EventoLia) => void;
  buscar?: typeof fetch;
};

export async function enviarPergunta({
  pedido,
  signal,
  aoEvento,
  buscar = fetch,
}: EntradaEnvio): Promise<ResultadoEnvio> {
  try {
    const resposta = await buscar("/api/lia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
      signal,
    });
    if (resposta.status === 429) {
      const corpo = (await resposta.json().catch(() => null)) as {
        mensagem?: string;
        uso?: { usadas: number; limite: number };
      } | null;
      return {
        tipo: "limite",
        mensagem: corpo?.mensagem ?? "Você chegou ao limite de perguntas de hoje.",
        uso: corpo?.uso ?? null,
      };
    }
    if (!resposta.ok || !resposta.body) return { tipo: "erro", mensagem: MENSAGEM_ERRO };

    const leitor = resposta.body.getReader();
    const decodificador = new TextDecoder();
    let resto = "";
    let terminou = false;
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) break;
      const lote = decodificarEventos(decodificador.decode(value, { stream: true }), resto);
      resto = lote.resto;
      for (const evento of lote.eventos) {
        if (evento.tipo === "erro") return { tipo: "erro", mensagem: evento.mensagem };
        if (evento.tipo === "fim") terminou = true;
        aoEvento(evento);
      }
    }
    return terminou ? { tipo: "ok" } : { tipo: "erro", mensagem: MENSAGEM_ERRO };
  } catch {
    return signal.aborted ? { tipo: "interrompido" } : { tipo: "erro", mensagem: MENSAGEM_ERRO };
  }
}
