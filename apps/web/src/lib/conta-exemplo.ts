import { z } from "zod";
import type { Perfil } from "@/lib/onboarding";

export const ABAS_CONFIGURACOES = {
  perfil: "Perfil",
  alertas: "Alertas",
  agenda: "Agenda",
  equipe: "Equipe",
  modelo: "Modelo de documento",
  calendario: "Calendário",
  seguranca: "Segurança",
  dados: "Dados",
} as const;

export type AbaConfiguracoes = keyof typeof ABAS_CONFIGURACOES;

export const abaConfiguracoesSchema = z
  .enum(Object.keys(ABAS_CONFIGURACOES) as [AbaConfiguracoes, ...AbaConfiguracoes[]])
  .catch("perfil");

export const perfilContaExemplo: Perfil = {
  nome: "Ana Souza",
  oab: "00.000",
  uf: "DF",
  areas: ["Cível e consumidor", "Trabalhista", "Previdenciário"],
  tribunais: ["TJDFT", "TRT10"],
  whatsapp: "",
};

export const DIAS_ANTECEDENCIA = [
  "5 dias úteis antes",
  "2 dias úteis antes",
  "No dia do prazo fatal",
  "No dia do prazo interno",
] as const;

export const novoFeriadoSchema = z.object({
  data: z.iso.date("Informe a data."),
  descricao: z.string().trim().min(3, "Descreva o feriado ou a suspensão.").max(120),
});

export type FeriadoProprio = z.infer<typeof novoFeriadoSchema> & { id: string };

export const feriadosExemplo: FeriadoProprio[] = [
  { id: "1", data: "2026-12-08", descricao: "Dia da Justiça (exemplo)" },
  { id: "2", data: "2026-12-21", descricao: "Suspensão de prazos do tribunal (exemplo)" },
];

export const sessoesExemplo = [
  { id: "1", dispositivo: "Chrome no computador", local: "Brasília, DF", atual: true },
  { id: "2", dispositivo: "Safari no celular", local: "Brasília, DF", atual: false },
];

export const LINK_AGENDA_EXEMPLO = "https://exemplo.tesia/agenda/token-de-exemplo.ics";

export const passosAgenda = [
  { nome: "Google Agenda", passo: "Outras agendas → Do URL → cole o link." },
  { nome: "Apple Calendário", passo: "Arquivo → Nova assinatura de calendário → cole o link." },
  { nome: "Outlook", passo: "Adicionar calendário → Assinar da Web → cole o link." },
];

export const planoAtualExemplo = {
  proximaCobranca: "15/11/2026",
  pagamento: "Cartão de exemplo",
};

export const faturasExemplo = [
  { id: "1", data: "15/10/2026", valor: "R$ 79,00", status: "Paga" },
  { id: "2", data: "15/09/2026", valor: "R$ 79,00", status: "Paga" },
];

export const planosEscolhaExemplo = [
  { id: "start", nome: "Start", preco: "R$ 79/mês", resumo: "15 peças por mês e 1 área" },
  { id: "pro", nome: "Pro", preco: "R$ 129/mês", resumo: "50 peças por mês e todas as áreas" },
];

export const exemploPlanoSchema = z
  .enum(["limite-80", "limite-100", "fim-teste"])
  .nullable()
  .catch(null);

export type ExemploPlano = NonNullable<z.infer<typeof exemploPlanoSchema>>;

export const LINK_INDICACAO_EXEMPLO = "https://exemplo.tesia/indicar/ANA-EXEMPLO";

export const indicacoesExemplo = [
  { id: "1", nome: "Advogado 1 (exemplo)", data: "02/10/2026", status: "Pagante" },
  { id: "2", nome: "Advogado 2 (exemplo)", data: "21/10/2026", status: "Cadastrado" },
];

export const MESES_GRATIS_EXEMPLO = 1;
