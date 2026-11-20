import type { AcaoLia } from "./acoes";

export type EventoLia =
  | { tipo: "inicio"; conversaId: string }
  | { tipo: "texto"; valor: string }
  | {
      tipo: "fim";
      mensagemId: string | null;
      acoes: AcaoLia[];
      uso: { usadas: number; limite: number };
    }
  | { tipo: "erro"; mensagem: string };

export function codificarEvento(evento: EventoLia) {
  return `${JSON.stringify(evento)}\n`;
}

export function decodificarEventos(pedaco: string, resto: string) {
  const linhas = (resto + pedaco).split("\n");
  const novoResto = linhas.pop() ?? "";
  const eventos: EventoLia[] = [];
  for (const linha of linhas) {
    if (!linha.trim()) continue;
    try {
      eventos.push(JSON.parse(linha) as EventoLia);
    } catch {
      continue;
    }
  }
  return { eventos, resto: novoResto };
}
