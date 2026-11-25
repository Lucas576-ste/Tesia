export type SituacaoIntimacao =
  "fila" | "lendo" | "aguardando" | "confirmado" | "concluida" | "erro";

export const ROTULOS_SITUACAO: Record<SituacaoIntimacao, string> = {
  fila: "Na fila",
  lendo: "Lendo o documento",
  aguardando: "Aguardando sua confirmação",
  confirmado: "Prazo confirmado",
  concluida: "Concluída",
  erro: "Não foi possível ler",
};

export type ItemIntimacao = {
  id: string;
  enviadaEm: string;
  partes: string;
  cnj: string | null;
  peca: string | null;
  situacao: SituacaoIntimacao;
  djen: boolean;
};
