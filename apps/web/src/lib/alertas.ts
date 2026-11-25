import { z } from "zod";

export const MOMENTOS_ALERTA = {
  "5_uteis": "5 dias úteis antes",
  "2_uteis": "2 dias úteis antes",
  fatal: "No dia do prazo fatal",
  interno: "No dia do prazo interno",
} as const;

export type MomentoAlerta = keyof typeof MOMENTOS_ALERTA;

export const preferenciasAlertaSchema = z.object({
  email: z.boolean(),
  dias: z.array(z.enum(["5_uteis", "2_uteis", "fatal", "interno"])).max(4),
});

export type PreferenciasAlerta = z.infer<typeof preferenciasAlertaSchema>;
