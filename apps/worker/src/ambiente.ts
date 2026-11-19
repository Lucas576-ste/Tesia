import { z } from "zod";

const ambienteSchema = z.object({
  DATABASE_URL: z.string().startsWith("postgres", "Defina DATABASE_URL."),
  NEXT_PUBLIC_SUPABASE_URL: z.url("Defina NEXT_PUBLIC_SUPABASE_URL."),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, "Defina SUPABASE_SERVICE_ROLE_KEY."),
  ANTHROPIC_API_KEY: z.string().min(20, "Defina ANTHROPIC_API_KEY."),
  EMBEDDINGS_API_KEY: z.string().min(20, "Defina EMBEDDINGS_API_KEY (Voyage)."),
  RESEND_API_KEY: z.string().optional(),
  ALERTA_REMETENTE: z.string().default("Tesia <onboarding@resend.dev>"),
  URL_APP: z.url().default("http://localhost:3000"),
  HORA_ALERTAS: z.coerce.number().int().min(0).max(23).default(7),
  INTERVALO_FILA_MS: z.coerce.number().int().positive().default(2000),
});

export const ambiente = ambienteSchema.parse(process.env);
