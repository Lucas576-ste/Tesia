import { z } from "zod";
import { AREAS_ATUACAO } from "@/lib/onboarding";
import type { LinhaPrazo, StatusPrazo } from "@/lib/prazo";

export const dadosProcessoSchema = z.object({
  cnj: z
    .string()
    .trim()
    .regex(/^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/, "Use o formato 0000000-00.0000.0.00.0000."),
  partes: z.string().trim().min(3, "Informe as partes.").max(200),
  area: z.enum(AREAS_ATUACAO, { error: "Escolha a área." }),
  tribunal: z.string().trim().min(2, "Informe o tribunal.").max(60),
  vara: z.string().trim().min(2, "Informe a vara.").max(120),
});

export type DadosProcesso = z.infer<typeof dadosProcessoSchema>;

export type EventoProcesso = {
  data: string;
  tipo: "intimacao" | "andamento" | "prazo" | "peca";
  titulo: string;
  descricao: string;
  link?: { href: string; rotulo: string };
};

export type Processo = Omit<DadosProcesso, "area"> & {
  area: string;
  id: string;
  proximoPrazo: string | null;
  status: StatusPrazo;
  prazos: LinhaPrazo[];
  eventos: EventoProcesso[];
  cliente: { id: string; nome: string } | null;
  rito: string | null;
  fase: string | null;
  nomeFase: string;
  origemFase: string;
  encerrado: boolean;
};
