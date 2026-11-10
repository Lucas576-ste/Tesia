import { z } from "zod";

export const TAMANHO_MAXIMO_PDF = 20 * 1024 * 1024;

export const BUCKET_INTIMACOES = "intimacoes";

export const STATUS_INTIMACAO = ["recebida", "processando", "analisada", "erro"] as const;

export type StatusIntimacao = (typeof STATUS_INTIMACAO)[number];

export const ROTULOS_STATUS: Record<StatusIntimacao | "enviando", string> = {
  enviando: "Enviando",
  recebida: "Na fila",
  processando: "Lendo o documento",
  analisada: "Pronta",
  erro: "Não foi possível ler",
};

export function caminhoIntimacao(escritorioId: string) {
  return `${escritorioId}/${crypto.randomUUID()}.pdf`;
}

export const registroSchema = z.object({
  caminho: z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.pdf$/),
});

export const idsSchema = z.array(z.uuid()).max(20);

export function motivoRecusa(arquivo: File) {
  if (!/\.pdf$/i.test(arquivo.name)) return "envie apenas PDF";
  if (arquivo.size > TAMANHO_MAXIMO_PDF) return "o limite é 20 MB";
  if (arquivo.size === 0) return "o arquivo está vazio";
  return null;
}
