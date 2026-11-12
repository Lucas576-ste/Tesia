import { z } from "zod";

const trecho = z.string();

export const analiseGravadaSchema = z.object({
  versao: z.literal(1),
  dados: z.object({
    numero_processo: z.string().nullable(),
    tribunal: z.string().nullable(),
    orgao: z.string().nullable(),
    uf: z.string().nullable(),
    municipio: z.string().nullable(),
    partes: z.array(z.object({ nome: z.string(), polo: z.enum(["ativo", "passivo"]).nullable() })),
    polo_cliente: z.enum(["ativo", "passivo"]).nullable(),
    area: z.string().nullable(),
    rito: z.string(),
    tipo_ato: z.string(),
    forma_intimacao: z
      .enum(["diario", "portal", "citacao", "nao_identificada"])
      .default("nao_identificada"),
    data_disponibilizacao: z.string().nullable(),
    data_envio_portal: z.string().nullable().default(null),
    resultado: z.string().nullable(),
    pontos: z.array(z.object({ titulo: z.string(), trecho })),
  }),
  resumo: z.object({
    o_que_aconteceu: z.string(),
    pontos_ataque: z.array(z.object({ titulo: z.string(), explicacao: z.string(), trecho })),
  }),
  pecas: z.array(
    z.object({
      codigo: z.string(),
      nome: z.string(),
      justificativa: z.string(),
      recomendada: z.boolean(),
    }),
  ),
  prazo: z
    .object({
      dias: z.number().int(),
      contagem: z.enum(["uteis", "corridos"]),
      fundamento: z.string(),
      regra_revisada: z.boolean(),
      forma: z.enum(["diario", "portal"]).nullable().default("diario"),
    })
    .nullable(),
  motivo_sem_prazo: z.string().nullable(),
});

export type AnaliseGravada = z.infer<typeof analiseGravadaSchema>;

export const memoriaCalculoSchema = z.object({
  linhas: z.array(z.string()),
  regra_revisada: z.boolean(),
});

export type MemoriaCalculo = z.infer<typeof memoriaCalculoSchema>;

export function nomePartes(partes: AnaliseGravada["dados"]["partes"]) {
  const ativo = partes.filter((parte) => parte.polo === "ativo").map((parte) => parte.nome);
  const passivo = partes.filter((parte) => parte.polo === "passivo").map((parte) => parte.nome);
  if (ativo.length && passivo.length) return `${ativo.join(", ")} x ${passivo.join(", ")}`;
  return partes.map((parte) => parte.nome).join(", ") || "Partes não identificadas";
}
