export type StatusLinhaPeca = "rascunho_pronto" | "protocolado";

export type LinhaPeca = {
  id: string;
  processoId: string;
  tipo: string;
  area: string;
  data: string;
  status: StatusLinhaPeca;
  partes: string;
  cnj: string;
  vencimento: string | null;
};
