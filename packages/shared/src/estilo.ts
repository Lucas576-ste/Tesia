import { z } from "zod";

export const perfilEstiloSchema = z.object({
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
