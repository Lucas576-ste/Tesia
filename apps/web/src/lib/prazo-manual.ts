import { z } from "zod";
import type { LinhaPrazo, TipoManual } from "@/lib/prazo";

export const TIPOS_MANUAIS: Record<TipoManual, string> = {
  prazo: "Prazo",
  audiencia: "Audiência",
  compromisso: "Compromisso",
};

const dataOpcional = z.union([z.iso.date("Informe uma data válida."), z.literal("")]);

export function hojeBrasilia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function esquemaPrazoManual(hoje: string) {
  return z
    .object({
      tipo: z.enum(["prazo", "audiencia", "compromisso"]),
      descricao: z.string().trim().min(3, "Descreva o prazo ou compromisso.").max(120),
      data: z.iso
        .date("Informe a data.")
        .refine((data) => data >= hoje, "Escolha hoje ou uma data futura."),
      hora: z.union([
        z.iso.time({ precision: -1, error: "Informe uma hora válida." }),
        z.literal(""),
      ]),
      processoId: z.string(),
      prazoInterno: dataOpcional,
      inicio: dataOpcional,
    })
    .superRefine(({ tipo, data, prazoInterno, inicio }, contexto) => {
      if (tipo !== "prazo" || !data) return;
      if (prazoInterno && prazoInterno > data) {
        contexto.addIssue({
          code: "custom",
          path: ["prazoInterno"],
          message: "O prazo interno não pode ser depois do prazo fatal.",
        });
      }
      if (inicio && inicio > data) {
        contexto.addIssue({
          code: "custom",
          path: ["inicio"],
          message: "O início não pode ser depois do prazo fatal.",
        });
      }
    });
}

export type PrazoManual = z.infer<ReturnType<typeof esquemaPrazoManual>>;

export type ProcessoResumo = Pick<LinhaPrazo, "partes" | "cnj" | "area"> & { id: string };
