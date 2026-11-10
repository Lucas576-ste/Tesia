const DIAS_SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function paraDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

function paraIso(data: Date) {
  return data.toISOString().slice(0, 10);
}

export function dataIso(ano: number, mes: number, dia: number) {
  return paraIso(new Date(Date.UTC(ano, mes - 1, dia)));
}

export function somarDias(iso: string, dias: number) {
  const data = paraDate(iso);
  data.setUTCDate(data.getUTCDate() + dias);
  return paraIso(data);
}

export function diaDaSemana(iso: string) {
  return paraDate(iso).getUTCDay();
}

export function fimDeSemana(iso: string) {
  return diaDaSemana(iso) % 6 === 0;
}

export function formatarData(iso: string) {
  return iso.split("-").reverse().join("/");
}

export function formatarComDia(iso: string) {
  return `${formatarData(iso)} (${DIAS_SEMANA[diaDaSemana(iso)] ?? ""})`;
}
