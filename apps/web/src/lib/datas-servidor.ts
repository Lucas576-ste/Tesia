import { criarCalendario, ehDiaUtil } from "@tesia/prazos";

export function hojeEmBrasilia(agora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

export function diasUteisAte(vencimento: string, hoje = hojeEmBrasilia()) {
  const calendario = criarCalendario();
  let total = 0;
  const dia = new Date(`${hoje}T00:00:00Z`);
  const fim = new Date(`${vencimento}T00:00:00Z`);
  while (dia < fim) {
    dia.setUTCDate(dia.getUTCDate() + 1);
    if (ehDiaUtil(dia.toISOString().slice(0, 10), calendario)) total += 1;
  }
  return total;
}
