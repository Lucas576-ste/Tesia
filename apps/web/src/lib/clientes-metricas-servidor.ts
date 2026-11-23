import { metricasSchema, type MetricasClientes } from "@/lib/clientes-metricas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export async function buscarMetricasClientes(): Promise<MetricasClientes | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.rpc("metricas_clientes");
  const linha = Array.isArray(data) ? data[0] : data;
  return metricasSchema.safeParse(linha).data ?? null;
}
