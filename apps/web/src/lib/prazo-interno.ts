import { z } from "zod";
import { criarCalendario, ehDiaUtil } from "@tesia/prazos";
import { hojeBrasilia } from "@/lib/hoje";
import { chaveData, type LinhaPrazo } from "@/lib/prazo";

export const DIAS_PRAZO_INTERNO = 2;

const calendario = criarCalendario();

export function isoParaData(iso: string) {
  return iso.split("-").reverse().join("/");
}

function textoIso(dia: Date) {
  return dia.toISOString().slice(0, 10);
}

function diaUtil(dia: Date) {
  return ehDiaUtil(textoIso(dia), calendario);
}

export function calcularPrazoInterno(fatalIso: string, hojeIso = hojeBrasilia()) {
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
  return chaveData(prazoInterno) < hojeBrasilia().replaceAll("-", "");
}
