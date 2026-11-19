export type NivelUrgencia = "concluido" | "vencido" | "hoje" | "ate3" | "mais3";

export type EntradaUrgencia = {
  concluido: boolean;
  diasUteis: number;
  diasAtraso: number;
  venceHoje: boolean;
};

export const LIMITE_DIAS_URGENTES = 3;

export function urgencia({
  concluido,
  diasUteis,
  diasAtraso,
  venceHoje,
}: EntradaUrgencia): NivelUrgencia {
  if (concluido) return "concluido";
  if (diasAtraso > 0) return "vencido";
  if (venceHoje) return "hoje";
  return diasUteis <= LIMITE_DIAS_URGENTES ? "ate3" : "mais3";
}

export function textoUrgencia(entrada: EntradaUrgencia) {
  const nivel = urgencia(entrada);
  if (nivel === "concluido") return "Concluído";
  if (nivel === "vencido")
    return entrada.diasAtraso === 1 ? "Venceu há 1 dia" : `Venceu há ${entrada.diasAtraso} dias`;
  if (nivel === "hoje") return "Vence hoje";
  if (entrada.diasUteis <= 1)
    return entrada.diasUteis === 1 ? "Vence amanhã" : "Vence sem dia útil antes";
  return `Faltam ${entrada.diasUteis} dias úteis`;
}

export function contarUrgencias(itens: EntradaUrgencia[]) {
  const contagem: Record<NivelUrgencia, number> = {
    concluido: 0,
    vencido: 0,
    hoje: 0,
    ate3: 0,
    mais3: 0,
  };
  for (const item of itens) contagem[urgencia(item)] += 1;
  return contagem;
}

export function pesoUrgencia(nivel: NivelUrgencia) {
  return { vencido: 0, hoje: 1, ate3: 2, mais3: 3, concluido: 4 }[nivel];
}
