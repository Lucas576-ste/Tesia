import { CODIGOS_FAIXA, type FaixaEtaria } from "@tesia/shared";
import { z } from "zod";

const contagemSchema = z.object({ chave: z.string(), total: z.number() });

export const metricasSchema = z.object({
  total: z.number(),
  novos_mes_atual: z.number(),
  novos_mes_anterior: z.number(),
  com_processo: z.number(),
  sem_processo: z.number(),
  top_origens: z.array(contagemSchema).catch([]),
  faixas_etarias: z.array(contagemSchema).catch([]),
  top_profissoes: z.array(contagemSchema).catch([]),
  ufs: z.array(z.string()).catch([]),
  cidades: z.array(z.string()).catch([]),
});

export type MetricasClientes = z.infer<typeof metricasSchema>;

export function variacaoMensal(atual: number, anterior: number) {
  if (anterior === 0) return atual === 0 ? { tipo: "igual" as const } : { tipo: "novo" as const };
  const percentual = Math.round(((atual - anterior) / anterior) * 100) || 0;
  return { tipo: percentual === 0 ? ("igual" as const) : ("variou" as const), percentual };
}

export function textoVariacao(atual: number, anterior: number) {
  const variacao = variacaoMensal(atual, anterior);
  if (variacao.tipo === "novo") return "Sem cadastros no mês anterior";
  if (variacao.tipo === "igual") return "Igual ao mês anterior";
  const sinal = (variacao.percentual ?? 0) > 0 ? "+" : "";
  return `${sinal}${variacao.percentual}% sobre o mês anterior`;
}

export function faixasEmOrdem(
  faixas: { chave: string; total: number }[],
): { faixa: FaixaEtaria; total: number }[] {
  const porChave = new Map(faixas.map(({ chave, total }) => [chave, total]));
  return CODIGOS_FAIXA.map((faixa) => ({ faixa, total: porChave.get(faixa) ?? 0 }));
}
