import { z } from "zod";
import type { LinhaPrazo, TipoManual } from "@/lib/prazo";

export const DATA_BASE_EXEMPLO = "2026-11-04";

export const TIPOS_MANUAIS: Record<TipoManual, string> = {
  prazo: "Prazo",
  audiencia: "Audiência",
  compromisso: "Compromisso",
};

export const prazoManualSchema = z.object({
  tipo: z.enum(["prazo", "audiencia", "compromisso"]),
  descricao: z.string().trim().min(3, "Descreva o prazo ou compromisso.").max(120),
  data: z.iso
    .date("Informe a data.")
    .refine((data) => data >= DATA_BASE_EXEMPLO, "Escolha hoje ou uma data futura."),
  hora: z.union([z.iso.time({ precision: -1, error: "Informe uma hora válida." }), z.literal("")]),
  processoId: z.string(),
});

export type PrazoManual = z.infer<typeof prazoManualSchema>;

export type ProcessoResumo = Pick<LinhaPrazo, "partes" | "cnj" | "area"> & { id: string };

export function contarDiasUteis(inicio: string, fim: string) {
  const dia = new Date(`${inicio}T00:00:00Z`);
  const ultimo = new Date(`${fim}T00:00:00Z`);
  let total = 0;
  while (dia < ultimo) {
    dia.setUTCDate(dia.getUTCDate() + 1);
    if (dia <= ultimo && dia.getUTCDay() % 6 !== 0) total += 1;
  }
  return total;
}

export function criarPrazoManual(
  id: string,
  { tipo, descricao, data, hora, processoId }: PrazoManual,
  processos: ProcessoResumo[],
): LinhaPrazo {
  const processo = processos.find((item) => item.id === processoId);
  return {
    id,
    partes: processo?.partes ?? "Sem processo",
    cnj: processo?.cnj ?? "",
    peca: descricao,
    area: processo?.area ?? "",
    vencimento: data.split("-").reverse().join("/"),
    diasUteis: contarDiasUteis(DATA_BASE_EXEMPLO, data),
    status: "nao_iniciado",
    tipo,
    hora: hora || undefined,
  };
}
