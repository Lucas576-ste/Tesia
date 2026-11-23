import { z } from "zod";

const falhaSchema = z.object({
  status: z.number().optional(),
  error: z.object({ error: z.object({ type: z.string().optional() }).optional() }).optional(),
  message: z.string().optional(),
});

export type ResumoFalha = { status: number | null; tipo: string | null; mensagem: string };

export function resumirFalha(erro: unknown): ResumoFalha {
  const lido = falhaSchema.safeParse(erro).data;
  const tipo = lido?.error?.error?.type ?? (erro instanceof Error ? erro.name : null);
  const texto = lido?.message ?? (erro instanceof Error ? erro.message : "erro desconhecido");
  return { status: lido?.status ?? null, tipo, mensagem: texto.slice(0, 200) };
}
