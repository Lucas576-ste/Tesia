export type SituacaoIntimacao =
  "fila" | "lendo" | "aguardando" | "confirmado" | "concluida" | "ignorada" | "erro";

export const ROTULOS_SITUACAO: Record<SituacaoIntimacao, string> = {
  fila: "Na fila",
  lendo: "Lendo o documento",
  aguardando: "Aguardando sua confirmação",
  confirmado: "Prazo confirmado",
  concluida: "Concluída",
  ignorada: "Ignorada",
  erro: "Não foi possível ler",
};
