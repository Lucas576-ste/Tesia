import type { DadosProcesso } from "@/lib/processo-tipos";
import type { SituacaoTratamento } from "@/lib/tratamento-intimacao";

export type DadosTratamento = {
  id: string;
  status: "recebida" | "processando" | "analisada" | "erro";
  tratamento: SituacaoTratamento;
  tratadaEm: string | null;
  tratadaPor: string | null;
  responsavelId: string | null;
  responsavelNome: string | null;
  tarefaId: string | null;
  prazoConfirmado: string | null;
  texto: string;
  fonte: "diario" | "eletronico" | null;
  tribunal: string | null;
  tipoPublicacao: string | null;
  termo: string | null;
  numeroProcesso: string | null;
  publicadaEm: string | null;
  processo: { id: string; cnj: string; partes: string } | null;
  inicioProvavel: {
    inicioIso: string;
    memoria: string[];
    avisoCalendario: string | null;
  } | null;
  sugestaoProcesso: DadosProcesso;
};
