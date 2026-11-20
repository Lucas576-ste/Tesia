export const BUCKET_MODELOS = "modelos";
export const TAMANHO_MAXIMO_MODELO = 5 * 1024 * 1024;
export const TIPO_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function caminhoModelo(escritorioId: string, usuarioId: string) {
  return `${escritorioId}/${usuarioId}/modelo-${crypto.randomUUID()}.docx`;
}

export function pastaModelo(escritorioId: string, usuarioId: string) {
  return `${escritorioId}/${usuarioId}/`;
}

export const CAMINHO_MODELO = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/modelo-[0-9a-f-]{36}\.docx$/;

export function motivoRecusaModelo(arquivo: File) {
  if (/\.pdf$/i.test(arquivo.name))
    return "Ainda não lemos timbrado em PDF. Salve o papel timbrado como .docx no Word e envie de novo.";
  if (!/\.docx$/i.test(arquivo.name)) return "Envie um arquivo .docx.";
  if (arquivo.size > TAMANHO_MAXIMO_MODELO) return "O modelo pode ter no máximo 5 MB.";
  if (arquivo.size === 0) return "O arquivo está vazio.";
  return null;
}
