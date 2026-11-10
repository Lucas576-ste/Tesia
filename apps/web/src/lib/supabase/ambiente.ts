import { z } from "zod";

const ambienteSchema = z.object({
  url: z.url("Defina NEXT_PUBLIC_SUPABASE_URL."),
  chave: z.string().min(20, "Defina NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."),
});

export function ambienteSupabase() {
  return ambienteSchema.parse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    chave: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
