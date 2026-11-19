import type { EtapaPrazo } from "@/lib/etapas-prazo";

export type StatusPrazo = "nao_iniciado" | "rascunho_pronto" | "protocolado";

export type TipoManual = "prazo" | "audiencia" | "compromisso";

export type LinhaPrazo = {
  id: string;
  partes: string;
  cnj: string;
  peca: string;
  area: string;
  vencimento: string;
  inicio?: string;
  prazoInterno?: string;
  diasUteis: number;
  status: StatusPrazo;
  tipo?: TipoManual;
  hora?: string;
  responsavel?: string;
  etapa?: EtapaPrazo;
  pecaId?: string;
  prazoId?: string;
  diasAtraso?: number;
};

export type ColunaQuadro = "vencido" | "hoje" | "ate3" | "mais3" | "concluido";

export function destinoPrazo({
  id,
  status,
  tipo,
  pecaId,
}: Pick<LinhaPrazo, "id" | "status" | "tipo" | "pecaId">) {
  if (tipo) return null;
  if (status !== "nao_iniciado" && pecaId) return `/app/pecas/${pecaId}`;
  return `/app/intimacoes/${id}`;
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
