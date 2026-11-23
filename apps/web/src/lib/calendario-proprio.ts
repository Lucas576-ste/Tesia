import { z } from "zod";
import { hojeBrasilia } from "@/lib/hoje";

export const MAXIMO_DIAS_PERIODO = 365;

export type ItemCalendario = {
  id: string;
  tipo: "dia" | "periodo";
  data: string;
  ate: string | null;
  descricao: string;
  tribunal: string | null;
};

function emMilissegundos(iso: string) {
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

export function diasDoPeriodo(data: string, ate: string) {
  return Math.round((emMilissegundos(ate) - emMilissegundos(data)) / 86_400_000) + 1;
}

function moverAnos(iso: string, anos: number) {
  const data = new Date(emMilissegundos(iso));
  data.setUTCFullYear(data.getUTCFullYear() + anos);
  return data.toISOString().slice(0, 10);
}

export const entradaCalendarioSchema = z
  .object({
    data: z.iso.date("Informe a data."),
    ate: z
      .union([z.iso.date("Informe uma data final válida."), z.literal("")])
      .optional()
      .default(""),
    descricao: z.string().trim().min(3, "Descreva o feriado ou a suspensão.").max(120),
    tribunal: z.string().trim().max(40).optional().default(""),
  })
  .superRefine((entrada, contexto) => {
    const hoje = hojeBrasilia();
    if (entrada.data < moverAnos(hoje, -2) || entrada.data > moverAnos(hoje, 5)) {
      contexto.addIssue({
        code: "custom",
        path: ["data"],
        message: "Use uma data entre 2 anos atrás e 5 anos à frente.",
      });
    }
    if (!entrada.ate) return;
    if (entrada.ate < entrada.data) {
      contexto.addIssue({
        code: "custom",
        path: ["ate"],
        message: "A data final não pode ser antes da inicial.",
      });
    } else if (diasDoPeriodo(entrada.data, entrada.ate) > MAXIMO_DIAS_PERIODO) {
      contexto.addIssue({
        code: "custom",
        path: ["ate"],
        message: `O período pode ter no máximo ${MAXIMO_DIAS_PERIODO} dias.`,
      });
    }
  })
  .transform((entrada) => ({
    ...entrada,
    ate: entrada.ate && entrada.ate !== entrada.data ? entrada.ate : "",
    tribunal: entrada.tribunal || null,
  }));

export type EntradaCalendario = z.input<typeof entradaCalendarioSchema>;

export function dataBrasileira(iso: string) {
  return iso.split("-").reverse().join("/");
}

export function rotuloDoItem(item: Pick<ItemCalendario, "data" | "ate">) {
  return item.ate
    ? `${dataBrasileira(item.data)} a ${dataBrasileira(item.ate)}`
    : dataBrasileira(item.data);
}

export function rotuloDoEscopo(tribunal: string | null) {
  return tribunal ? `Só ${tribunal}` : "Todos os processos";
}

export function ordenarItens(itens: ItemCalendario[]) {
  return [...itens].sort(
    (a, b) => a.data.localeCompare(b.data) || a.descricao.localeCompare(b.descricao, "pt-BR"),
  );
}

export function textoAvisoPrazos(quantidade: number) {
  if (quantidade === 0) return null;
  const sujeito = quantidade === 1 ? "1 prazo aberto vence" : `${quantidade} prazos abertos vencem`;
  return `${sujeito} depois dessa data. Os prazos já calculados não mudam sozinhos: confira em Prazos.`;
}
