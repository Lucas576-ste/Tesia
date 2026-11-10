import { z } from "zod";

const ambienteSchema = z.object({
  DATABASE_URL: z.string().startsWith("postgres", "Defina DATABASE_URL."),
  NEXT_PUBLIC_SUPABASE_URL: z.url("Defina NEXT_PUBLIC_SUPABASE_URL."),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, "Defina SUPABASE_SERVICE_ROLE_KEY."),
  INTERVALO_FILA_MS: z.coerce.number().int().positive().default(2000),
});

export const ambiente = ambienteSchema.parse(process.env);
