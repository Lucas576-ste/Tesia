import { z } from "zod";

export const PARTES_APRENDIZADO = [
  "abertura",
  "fatos",
  "fundamentacao",
  "pedidos",
  "fechamento",
] as const;

export type ParteAprendizado = (typeof PARTES_APRENDIZADO)[number];

export const ROTULOS_PARTE: Record<ParteAprendizado, string> = {
  abertura: "Abertura",
  fatos: "Fatos",
  fundamentacao: "Fundamentação",
  pedidos: "Pedidos",
  fechamento: "Fechamento",
};

const aprendizadosSchema = z.array(
  z.object({ parte: z.enum(PARTES_APRENDIZADO), itens: z.array(z.string()) }),
);

export const perfilEstiloSchema = z.object({
  aprendizados: aprendizadosSchema,
  estrutura_por_tipo: z.array(z.object({ tipo: z.string(), secoes: z.array(z.string()) })),
  tom: z.string(),
  tamanho_frases: z.enum(["curtas", "medias", "longas"]),
  citacao_lei: z.string(),
  citacao_jurisprudencia: z.string(),
  referencias_frequentes: z.array(z.string()),
  abertura: z.string(),
  fechamento: z.string(),
  expressoes_tipicas: z.array(z.string()),
  frases_exibicao: z.array(z.string()),
});

export type PerfilEstilo = z.infer<typeof perfilEstiloSchema>;

export const perfilGravadoSchema = perfilEstiloSchema.extend({
  aprendizados: aprendizadosSchema.default([]),
});

export type PerfilGravado = z.infer<typeof perfilGravadoSchema>;

export function idAprendizado(parte: ParteAprendizado, texto: string) {
  let hash = 2166136261;
  for (const caractere of `${parte}:${texto}`) {
    hash = Math.imul(hash ^ caractere.codePointAt(0)!, 16777619) >>> 0;
  }
  return `${parte}-${hash.toString(36)}`;
}

export type NivelEstilo = {
  codigo: "nenhum" | "basico" | "bom" | "otimo";
  indice: 0 | 1 | 2 | 3;
  rotulo: string;
};

export const NIVEIS_ESTILO = [
  { codigo: "basico", rotulo: "Básico", minimo: 1 },
  { codigo: "bom", rotulo: "Bom", minimo: 5 },
  { codigo: "otimo", rotulo: "Ótimo", minimo: 8 },
] as const;

export function nivelEstilo(lidas: number): NivelEstilo {
  const indice = NIVEIS_ESTILO.filter(({ minimo }) => lidas >= minimo).length as 0 | 1 | 2 | 3;
  const nivel = NIVEIS_ESTILO[indice - 1];
  return nivel
    ? { codigo: nivel.codigo, indice, rotulo: nivel.rotulo }
    : { codigo: "nenhum", indice: 0, rotulo: "Sem estilo" };
}

export function proximaAcaoEstilo(lidas: number) {
  const proximo = NIVEIS_ESTILO.find(({ minimo }) => lidas < minimo);
  if (!proximo) {
    return "Seu estilo está completo. A Lia continua aprendendo com as peças que você revisa.";
  }
  const faltam = proximo.minimo - lidas;
  return `Envie mais ${faltam} ${faltam === 1 ? "peça" : "peças"} para chegar ao nível ${proximo.rotulo}.`;
}
