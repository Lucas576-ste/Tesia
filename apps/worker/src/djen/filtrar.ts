import { htmlParaTexto } from "@tesia/shared";
import { z } from "zod";

export const comunicacaoSchema = z.object({
  id: z.number().int(),
  ativo: z.boolean(),
  status: z.string().nullable().optional(),
  data_disponibilizacao: z.iso.date(),
  data_cancelamento: z.string().nullable().optional(),
  texto: z.string().nullable(),
  siglaTribunal: z.string().nullable().optional(),
  nomeOrgao: z.string().nullable().optional(),
  numero_processo: z.string().nullable().optional(),
  tipoComunicacao: z.string().nullable().optional(),
  tipoDocumento: z.string().nullable().optional(),
  destinatarioadvogados: z
    .array(
      z.object({
        advogado: z.object({ numero_oab: z.string().nullable(), uf_oab: z.string().nullable() }),
      }),
    )
    .default([]),
});

export const respostaSchema = z.object({
  count: z.number().int(),
  items: z.array(comunicacaoSchema),
});

export type Comunicacao = z.infer<typeof comunicacaoSchema>;

export function normalizarOab(numero: string) {
  return numero.replace(/\D/g, "").replace(/^0+/, "");
}

export function eDoAdvogado(comunicacao: Comunicacao, oab: string, uf: string) {
  if (!comunicacao.ativo || comunicacao.data_cancelamento) return false;
  if (!comunicacao.texto?.trim()) return false;
  const alvo = normalizarOab(oab);
  return comunicacao.destinatarioadvogados.some(
    ({ advogado }) =>
      normalizarOab(advogado.numero_oab ?? "") === alvo &&
      (advogado.uf_oab ?? "").toUpperCase() === uf.toUpperCase(),
  );
}

export function paraIntimacao(comunicacao: Comunicacao) {
  return {
    djen_id: comunicacao.id,
    texto: htmlParaTexto(comunicacao.texto ?? ""),
    data_disponibilizacao: comunicacao.data_disponibilizacao,
  };
}
