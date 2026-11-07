import { z } from "zod";
import type { LinhaPrazo, TipoManual } from "@/lib/prazo";
import { calcularPrazoInterno, DATA_BASE_EXEMPLO, isoParaData } from "@/lib/prazo-interno";

export const TIPOS_MANUAIS: Record<TipoManual, string> = {
  prazo: "Prazo",
  audiencia: "Audiência",
  compromisso: "Compromisso",
};

const dataOpcional = z.union([z.iso.date("Informe uma data válida."), z.literal("")]);

export const prazoManualSchema = z
  .object({
    tipo: z.enum(["prazo", "audiencia", "compromisso"]),
    descricao: z.string().trim().min(3, "Descreva o prazo ou compromisso.").max(120),
    data: z.iso
      .date("Informe a data.")
      .refine((data) => data >= DATA_BASE_EXEMPLO, "Escolha hoje ou uma data futura."),
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
  { tipo, descricao, data, hora, processoId, prazoInterno, inicio }: PrazoManual,
  processos: ProcessoResumo[],
): LinhaPrazo {
  const processo = processos.find((item) => item.id === processoId);
  return {
    id,
    partes: processo?.partes ?? "Sem processo",
    cnj: processo?.cnj ?? "",
    peca: descricao,
    area: processo?.area ?? "",
    vencimento: isoParaData(data),
    ...(tipo === "prazo" && {
      prazoInterno: isoParaData(prazoInterno || calcularPrazoInterno(data)),
      inicio: inicio ? isoParaData(inicio) : undefined,
    }),
    diasUteis: contarDiasUteis(DATA_BASE_EXEMPLO, data),
    status: "nao_iniciado",
    tipo,
    hora: hora || undefined,
  };
}
