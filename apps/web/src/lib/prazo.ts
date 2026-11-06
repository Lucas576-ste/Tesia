export type StatusPrazo = "nao_iniciado" | "rascunho_pronto" | "protocolado";

export type TipoManual = "prazo" | "audiencia" | "compromisso";

export type LinhaPrazo = {
  id: string;
  partes: string;
  cnj: string;
  peca: string;
  area: string;
  vencimento: string;
  diasUteis: number;
  status: StatusPrazo;
  tipo?: TipoManual;
  hora?: string;
  responsavel?: string;
};

export type ColunaQuadro = "hoje" | "proximos" | "depois" | "rascunho" | "protocolado";

const LIMITE_DIAS_CRITICOS = 3;

export function destinoPrazo({ id, status, tipo }: Pick<LinhaPrazo, "id" | "status" | "tipo">) {
  if (tipo) return null;
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
    verbo: maisUrgente.tipo && maisUrgente.tipo !== "prazo" ? "é" : "vence",
    href: destinoPrazo(maisUrgente),
  };
}

export function colunaPrazo({ status, diasUteis }: LinhaPrazo): ColunaQuadro {
  if (status === "protocolado") return "protocolado";
  if (status === "rascunho_pronto") return "rascunho";
  if (diasUteis === 0) return "hoje";
  return diasUteis <= LIMITE_DIAS_CRITICOS ? "proximos" : "depois";
}

export function chaveData(data: string) {
  return data.split("/").reverse().join("");
}

export function ordenarPrazos(prazos: LinhaPrazo[]) {
  return [...prazos].sort((a, b) => {
    const protocoladoA = a.status === "protocolado" ? 1 : 0;
    const protocoladoB = b.status === "protocolado" ? 1 : 0;
    if (protocoladoA !== protocoladoB) return protocoladoA - protocoladoB;
    return chaveData(a.vencimento).localeCompare(chaveData(b.vencimento));
  });
}

export function contarIndicadores(prazos: LinhaPrazo[]) {
  const abertos = prazos.filter(({ status }) => status !== "protocolado");
  return {
    abertos: abertos.length,
    vencendo: abertos.filter(({ diasUteis }) => diasUteis <= LIMITE_DIAS_CRITICOS).length,
    rascunhos: prazos.filter(({ status }) => status === "rascunho_pronto").length,
    protocolados: prazos.length - abertos.length,
  };
}
