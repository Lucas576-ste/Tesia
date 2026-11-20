export const ROTULOS_ACAO = {
  abrir_rascunho: "Abrir rascunho",
  ver_prazo: "Ver prazo deste processo",
  ir_estilo: "Ir para Meu estilo",
  vincular_cliente: "Vincular cliente",
} as const;

export type IdAcao = keyof typeof ROTULOS_ACAO;

export type AcaoLia = { id: IdAcao; rotulo: string; href: string };

export type IdsDaTela = { processoId?: string; pecaId?: string };

const MARCADOR = /\[\[acao:([a-z_]+)\]\]/g;

export function hrefDaAcao(id: IdAcao, ids: IdsDaTela) {
  if (id === "ir_estilo") return "/app/estilo";
  if (id === "abrir_rascunho") return ids.pecaId ? `/app/pecas/${ids.pecaId}` : null;
  return ids.processoId ? `/app/processos/${ids.processoId}` : null;
}

export function separarAcoes(texto: string, ids: IdsDaTela) {
  const acoes: AcaoLia[] = [];
  for (const [, nome] of texto.matchAll(MARCADOR)) {
    if (!nome || !(nome in ROTULOS_ACAO)) continue;
    const id = nome as IdAcao;
    const href = hrefDaAcao(id, ids);
    if (href && !acoes.some((acao) => acao.id === id)) {
      acoes.push({ id, rotulo: ROTULOS_ACAO[id], href });
    }
  }
  return {
    texto: texto
      .replace(MARCADOR, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
    acoes,
  };
}

export function ocultarMarcadores(texto: string) {
  return texto
    .replace(MARCADOR, "")
    .replace(/\[\[[^\]]*\]?$/, "")
    .trimEnd();
}
