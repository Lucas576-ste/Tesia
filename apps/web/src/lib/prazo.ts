export type StatusPrazo = "nao_iniciado" | "rascunho_pronto" | "protocolado";

export type LinhaPrazo = {
  id: string;
  partes: string;
  cnj: string;
  peca: string;
  vencimento: string;
  diasUteis: number;
  status: StatusPrazo;
};

const LIMITE_DIAS_CRITICOS = 3;

export function destinoPrazo({ id, status }: Pick<LinhaPrazo, "id" | "status">) {
  return status === "nao_iniciado" ? `/app/intimacoes/${id}` : `/app/pecas/${id}`;
}

function textoVencimento({ diasUteis, vencimento }: LinhaPrazo) {
  const data = vencimento.slice(0, 5);
  if (diasUteis === 0) return `hoje (${data})`;
  if (diasUteis === 1) return `amanhã (${data})`;
  return `em ${diasUteis} dias úteis (${data})`;
}

export function prazoCritico(prazos: LinhaPrazo[]) {
  const criticos = prazos.filter(
    ({ status, diasUteis }) => status !== "protocolado" && diasUteis <= LIMITE_DIAS_CRITICOS,
  );
  if (criticos.length === 0) return null;

  const maisUrgente = criticos.reduce((atual, prazo) =>
    prazo.diasUteis < atual.diasUteis ? prazo : atual,
  );

  return {
    variante: maisUrgente.diasUteis === 0 ? ("hoje" as const) : ("padrao" as const),
    peca: maisUrgente.peca,
    partes: maisUrgente.partes,
    prazo: textoVencimento(maisUrgente),
    href: destinoPrazo(maisUrgente),
  };
}
