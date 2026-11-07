import { z } from "zod";
import { chaveData, type LinhaPrazo } from "@/lib/prazo";

export const DATA_BASE_EXEMPLO = "2026-11-04";
export const DIAS_PRAZO_INTERNO = 2;

const FERIADOS_EXEMPLO = ["2026-11-02", "2026-11-15", "2026-11-20", "2026-12-25", "2027-01-01"];

export function isoParaData(iso: string) {
  return iso.split("-").reverse().join("/");
}

function textoIso(dia: Date) {
  return dia.toISOString().slice(0, 10);
}

function diaUtil(dia: Date) {
  return dia.getUTCDay() % 6 !== 0 && !FERIADOS_EXEMPLO.includes(textoIso(dia));
}

export function calcularPrazoInterno(fatalIso: string, hojeIso = DATA_BASE_EXEMPLO) {
  const dia = new Date(`${fatalIso}T00:00:00Z`);
  let restantes = DIAS_PRAZO_INTERNO;
  while (restantes > 0) {
    dia.setUTCDate(dia.getUTCDate() - 1);
    if (diaUtil(dia)) restantes -= 1;
  }
  const calculado = textoIso(dia);
  if (calculado >= hojeIso) return calculado;
  return hojeIso <= fatalIso ? hojeIso : fatalIso;
}

export function prazoInternoSchema(fatalIso: string) {
  return z.iso
    .date("Informe a data.")
    .refine((data) => data <= fatalIso, "O prazo interno não pode ser depois do prazo fatal.");
}

export function prazoInternoVencido({
  prazoInterno,
  status,
}: Pick<LinhaPrazo, "prazoInterno" | "status">) {
  if (!prazoInterno || status === "protocolado") return false;
  return chaveData(prazoInterno) < DATA_BASE_EXEMPLO.replaceAll("-", "");
}
