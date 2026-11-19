import { z } from "zod";
import { dadosDoPlano, idSchema, type EstadoPlano } from "@/lib/plano";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function lerPlano(): Promise<EstadoPlano> {
  const supabase = await criarClienteServidor();
  const [{ data: assinatura }, { data: uso }] = await Promise.all([
    supabase.from("assinaturas").select("status, plano_codigo, periodo_fim").maybeSingle(),
    supabase.rpc("uso_pecas_atual"),
  ]);
  const linha = z
    .object({
      status: z.string(),
      plano_codigo: z.string().nullable(),
      periodo_fim: z.string().nullable(),
    })
    .safeParse(assinatura).data;
  const consumo = z.array(z.object({ usadas: z.number(), limite: z.number() })).safeParse(uso)
    .data?.[0];
  const teste = linha?.status === "trial";
  const id = teste ? "pro" : idSchema.parse(linha?.plano_codigo);
  const dados = dadosDoPlano(id);
  const plano = teste ? { ...dados, nome: "Teste grátis" } : dados;
  return {
    id,
    teste,
    fimPeriodo: linha?.periodo_fim ?? null,
    plano,
    uso: { usadas: consumo?.usadas ?? 0, limite: consumo?.limite ?? plano.limite },
  };
}
