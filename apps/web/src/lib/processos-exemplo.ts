import { z } from "zod";
import { processosExemplo, prazosExemplo } from "@/components/layout/dados-exemplo";
import { AREAS_ATUACAO } from "@/lib/onboarding";
import { chaveData, ordenarPrazos, type LinhaPrazo, type StatusPrazo } from "@/lib/prazo";

export const dadosProcessoSchema = z.object({
  cnj: z
    .string()
    .trim()
    .regex(/^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/, "Use o formato 0000000-00.0000.0.00.0000."),
  partes: z.string().trim().min(3, "Informe as partes."),
  area: z.enum(AREAS_ATUACAO, { error: "Escolha a área." }),
  tribunal: z.string().trim().min(2, "Informe o tribunal."),
  vara: z.string().trim().min(2, "Informe a vara."),
});

export type DadosProcesso = z.infer<typeof dadosProcessoSchema>;

export type EventoProcesso = {
  data: string;
  tipo: "intimacao" | "prazo" | "peca";
  titulo: string;
  descricao: string;
  link?: { href: string; rotulo: string };
};

export type Processo = DadosProcesso & {
  id: string;
  proximoPrazo: string | null;
  status: StatusPrazo;
  prazos: LinhaPrazo[];
  eventos: EventoProcesso[];
};

const complementos: Record<string, { tribunal: string; vara: string; eventos: EventoProcesso[] }> =
  {
    "1": {
      tribunal: "TJDFT",
      vara: "2ª Vara Cível de Brasília",
      eventos: [
        {
          data: "14/10/2026",
          tipo: "intimacao",
          titulo: "Intimação disponibilizada",
          descricao: "Decisão abre prazo para contestar.",
          link: { href: "/app/intimacoes/1", rotulo: "Ver análise" },
        },
        {
          data: "06/11/2026",
          tipo: "prazo",
          titulo: "Prazo da contestação",
          descricao: "Peça ainda não gerada.",
        },
      ],
    },
    "2": {
      tribunal: "TRT10",
      vara: "5ª Vara do Trabalho de Brasília",
      eventos: [
        {
          data: "21/10/2026",
          tipo: "intimacao",
          titulo: "Intimação disponibilizada",
          descricao: "Despacho abre prazo para falar sobre os cálculos.",
          link: { href: "/app/intimacoes/2", rotulo: "Ver análise" },
        },
        {
          data: "04/11/2026",
          tipo: "prazo",
          titulo: "Prazo da manifestação sobre cálculos",
          descricao: "Peça ainda não gerada.",
        },
      ],
    },
    "3": {
      tribunal: "TRF1",
      vara: "Juizado Especial Federal do DF",
      eventos: [
        {
          data: "15/06/2026",
          tipo: "peca",
          titulo: "Petição inicial",
          descricao: "Protocolada.",
          link: { href: "/app/pecas/6", rotulo: "Abrir peça" },
        },
        {
          data: "30/10/2026",
          tipo: "intimacao",
          titulo: "Intimação recebida",
          descricao: "Sentença publicada.",
        },
        {
          data: "03/11/2026",
          tipo: "peca",
          titulo: "Recurso inominado",
          descricao: "Rascunho pronto para revisão.",
          link: { href: "/app/pecas/3", rotulo: "Abrir peça" },
        },
        {
          data: "16/11/2026",
          tipo: "prazo",
          titulo: "Prazo do recurso inominado",
          descricao: "Em aberto.",
        },
      ],
    },
    "4": {
      tribunal: "TJDFT",
      vara: "3ª Vara Cível de Brasília",
      eventos: [
        {
          data: "18/08/2026",
          tipo: "peca",
          titulo: "Réplica",
          descricao: "Protocolada.",
          link: { href: "/app/pecas/7", rotulo: "Abrir peça" },
        },
        {
          data: "14/10/2026",
          tipo: "intimacao",
          titulo: "Intimação recebida",
          descricao: "Sentença publicada.",
        },
        {
          data: "03/11/2026",
          tipo: "peca",
          titulo: "Apelação",
          descricao: "Rascunho pronto para revisão.",
          link: { href: "/app/pecas/4", rotulo: "Abrir peça" },
        },
        {
          data: "05/11/2026",
          tipo: "prazo",
          titulo: "Prazo da apelação",
          descricao: "Em aberto.",
        },
      ],
    },
    "5": {
      tribunal: "TRT10",
      vara: "3ª Vara do Trabalho de Brasília",
      eventos: [
        {
          data: "21/10/2026",
          tipo: "intimacao",
          titulo: "Intimação recebida",
          descricao: "Sentença publicada.",
        },
        {
          data: "30/10/2026",
          tipo: "peca",
          titulo: "Recurso ordinário",
          descricao: "Protocolado.",
          link: { href: "/app/pecas/5", rotulo: "Abrir peça" },
        },
        {
          data: "03/11/2026",
          tipo: "prazo",
          titulo: "Prazo do recurso ordinário",
          descricao: "Cumprido.",
        },
      ],
    },
  };

function eventosRecentes(eventos: EventoProcesso[]) {
  return [...eventos].sort((a, b) => chaveData(b.data).localeCompare(chaveData(a.data)));
}

function montarProcessos(): Processo[] {
  return ordenarPrazos(prazosExemplo).flatMap((prazo) => {
    const complemento = complementos[prazo.id];
    const processo = processosExemplo.find(({ id }) => id === prazo.id);
    const area = dadosProcessoSchema.shape.area.safeParse(prazo.area);
    if (!complemento || !processo || !area.success) return [];
    return {
      id: processo.id,
      cnj: processo.cnj,
      partes: processo.partes,
      area: area.data,
      tribunal: complemento.tribunal,
      vara: complemento.vara,
      proximoPrazo: prazo.status === "protocolado" ? null : prazo.vencimento,
      status: prazo.status,
      prazos: prazosExemplo.filter(({ id }) => id === processo.id),
      eventos: eventosRecentes(complemento.eventos),
    };
  });
}

const processos = montarProcessos();

export function listarProcessos() {
  return processos;
}

export function buscarProcesso(id: string) {
  return processos.find((processo) => processo.id === id);
}
