import { extractText, getDocumentProxy } from "unpdf";
import { RespostaInvalidaDaIa, type Transcricao } from "./transcricao.js";

export const MINIMO_CARACTERES_POR_PAGINA = 100;

export type Leitura =
  | { origem: "pdf"; texto: string; paginas: number }
  | { origem: "ia"; texto: string; paginas: number; transcricao: Transcricao };

export type OpcoesLeitura = {
  transcrever: (pdf: Uint8Array) => Promise<Transcricao>;
};

function normalizar(texto: string) {
  return texto
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function textoSuficiente(texto: string, paginas: number) {
  const caracteres = texto.replace(/\s/g, "").length;
  return caracteres >= MINIMO_CARACTERES_POR_PAGINA * Math.max(paginas, 1);
}

export async function lerDocumento(
  pdf: Uint8Array,
  { transcrever }: OpcoesLeitura,
): Promise<Leitura> {
  const documento = await getDocumentProxy(new Uint8Array(pdf));
  const { totalPages, text } = await extractText(documento, { mergePages: true }).finally(() =>
    documento.loadingTask.destroy(),
  );
  const texto = normalizar(text);
  if (textoSuficiente(texto, totalPages)) return { origem: "pdf", texto, paginas: totalPages };

  const transcricao = await transcrever(pdf);
  const transcrito = normalizar(transcricao.texto);
  if (!transcrito) throw new RespostaInvalidaDaIa("A IA não encontrou texto no documento");
  return { origem: "ia", texto: transcrito, paginas: totalPages, transcricao };
}
