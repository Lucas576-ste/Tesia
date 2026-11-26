import { z } from "zod";
import type { LinhaPrazo, TipoManual } from "@/lib/prazo";

export const TIPOS_MANUAIS: Record<TipoManual, string> = {
  prazo: "Prazo",
  audiencia: "Audiência",
  compromisso: "Compromisso",
};

const dataOpcional = z.union([z.iso.date("Informe uma data válida."), z.literal("")]);

export { hojeBrasilia } from "@/lib/hoje";

export const calculoPrazoSchema = z.object({
  forma: z.enum(["diario", "portal"]),
  marco: z.iso.date("Informe a data da publicação."),
  abertura: dataOpcional,
  dias: z.number().int().min(1, "Informe os dias.").max(365, "Informe até 365 dias."),
  contagem: z.enum(["uteis", "corridos"]),
  fundamento: z.string().trim().max(200),
  regraId: z.union([z.uuid(), z.literal("")]),
});

export type CalculoPrazo = z.infer<typeof calculoPrazoSchema>;

export type PresetPrazo = {
  id: string;
  peca: string;
  dias: number;
  contagem: "uteis" | "corridos";
  fundamento: string;
  revisada: boolean;
};

export type RegraParaPreset = {
  id: string;
  peca: string;
  dias: number;
  contagem: "uteis" | "corridos";
  fundamento: string;
  revisada: boolean;
};

export function nomeDaPeca(nomes: Map<string, string>, area: string, codigo: string) {
  return nomes.get(`${area}|${codigo}`) ?? nomes.get(`geral|${codigo}`) ?? codigo;
}

export function rotuloPreset({ peca, dias, contagem, fundamento }: PresetPrazo) {
  return `${peca} · ${dias} dias ${contagem === "uteis" ? "úteis" : "corridos"} (${fundamento})`;
}

export function agruparPresets(regras: RegraParaPreset[]): PresetPrazo[] {
  const grupos = new Map<string, PresetPrazo>();
  for (const regra of regras) {
    const chave = `${regra.peca}|${regra.dias}|${regra.contagem}|${regra.fundamento}`;
    const existente = grupos.get(chave);
    if (existente) existente.revisada = existente.revisada && regra.revisada;
    else grupos.set(chave, { ...regra });
  }
  return [...grupos.values()].sort(
    (a, b) => a.peca.localeCompare(b.peca, "pt-BR") || a.dias - b.dias,
  );
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
      calculo: calculoPrazoSchema.optional(),
      responsavelId: z.union([z.uuid(), z.literal("")]).optional(),
      observacoes: z.string().trim().max(500, "Use até 500 caracteres nas observações.").optional(),
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
