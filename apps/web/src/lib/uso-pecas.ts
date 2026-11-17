import { z } from "zod";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type UsoPecas = { usadas: number; limite: number };

const usoSchema = z.array(z.object({ usadas: z.number().int(), limite: z.number().int() }));

export async function buscarUsoPecas(): Promise<UsoPecas> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.rpc("uso_pecas_atual");
  return usoSchema.safeParse(data).data?.[0] ?? { usadas: 0, limite: 0 };
}
