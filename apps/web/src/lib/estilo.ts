import { z } from "zod";

export const BUCKET_ESTILO = "estilo";
export const MINIMO_PECAS_ESTILO = 5;
export const MAXIMO_PECAS_ESTILO = 10;
export const TAMANHO_MAXIMO_PECA = 20 * 1024 * 1024;
export const ACEITOS_PECA_ESTILO = ".pdf,.docx";

const TIPOS: Record<"pdf" | "docx", string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const STATUS_PECA_ESTILO = ["processando", "lido", "erro"] as const;

export type StatusPecaEstilo = (typeof STATUS_PECA_ESTILO)[number] | "enviando";

export const ROTULOS_PECA_ESTILO: Record<StatusPecaEstilo, string> = {
  enviando: "Enviando",
  processando: "Lendo",
  lido: "Lido",
  erro: "Não foi possível ler",
};

export type PecaEstilo = {
  id: string;
  nome: string;
  data: string;
  status: StatusPecaEstilo;
  trechos: number;
  erro?: string;
  temporaria?: boolean;
};

export function extensaoPeca(nome: string) {
  const extensao = nome.toLowerCase().match(/\.(pdf|docx)$/)?.[1];
  return extensao === "pdf" || extensao === "docx" ? extensao : null;
}

export function tipoDoArquivo(extensao: "pdf" | "docx") {
  return TIPOS[extensao];
}

export function caminhoPecaEstilo(escritorioId: string, usuarioId: string, extensao: string) {
  return `${escritorioId}/${usuarioId}/${crypto.randomUUID()}.${extensao}`;
}

export function motivoRecusaPeca(arquivo: File) {
  if (!extensaoPeca(arquivo.name)) return "Envie PDF ou Word (.docx)";
  if (arquivo.size > TAMANHO_MAXIMO_PECA) return "O limite é 20 MB";
  if (arquivo.size === 0) return "O arquivo está vazio";
  return null;
}

export const registroPecaSchema = z.object({
  caminho: z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(pdf|docx)$/),
  nome: z.string().trim().min(1).max(200),
});
