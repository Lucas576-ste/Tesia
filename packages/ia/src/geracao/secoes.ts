export type SecaoPeca = { titulo: string; texto: string };

export type Pendencia = { secao: number; titulo: string; texto: string };

const SECAO = /<secao\s+titulo="([^"]*)"\s*>([\s\S]*?)<\/secao>/g;
const CONFIRMAR = /\[CONFIRMAR:\s*([^\]]+)\]/g;

export function separarSecoes(resposta: string): SecaoPeca[] {
  return [...resposta.matchAll(SECAO)]
    .map(([, titulo, texto]) => ({ titulo: (titulo ?? "").trim(), texto: (texto ?? "").trim() }))
    .filter((secao) => secao.texto.length > 0);
}

export function acharPendencias(secoes: SecaoPeca[]): Pendencia[] {
  return secoes.flatMap((secao, indice) =>
    [...secao.texto.matchAll(CONFIRMAR)].map(([, texto]) => ({
      secao: indice,
      titulo: secao.titulo,
      texto: (texto ?? "").trim(),
    })),
  );
}
