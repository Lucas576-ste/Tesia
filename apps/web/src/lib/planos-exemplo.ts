import type { EtapasPrazo } from "@/lib/etapas-prazo";

export const PLANOS_DEMO = {
  start: {
    nome: "Start",
    preco: "R$ 79/mês",
    limite: 10,
    usadas: 6,
    pacote: "R$ 29",
    maxAreas: 1,
    equipe: false,
    recursosPro: false,
  },
  pro: {
    nome: "Individual",
    preco: "R$ 129/mês",
    limite: 7,
    usadas: 3,
    pacote: "R$ 19",
    maxAreas: null,
    equipe: false,
    recursosPro: true,
  },
  fundador: {
    nome: "Individual (fundador)",
    preco: "R$ 79/mês",
    limite: 7,
    usadas: 3,
    pacote: "R$ 19",
    maxAreas: null,
    equipe: false,
    recursosPro: true,
  },
  sociedade: {
    nome: "Sócio",
    preco: "R$ 219/mês",
    limite: 15,
    usadas: 6,
    pacote: "R$ 19",
    maxAreas: null,
    equipe: true,
    recursosPro: true,
  },
} as const;

export type IdPlanoDemo = keyof typeof PLANOS_DEMO;

export const SOCIO_EXEMPLO = "Bruno Lima";

export const etapasExemplo: Record<string, EtapasPrazo> = {
  "1": { atual: "elaborar", responsaveis: { elaborar: null, revisar: null, protocolar: null } },
  "2": {
    atual: "elaborar",
    responsaveis: { elaborar: SOCIO_EXEMPLO, revisar: "Ana Souza", protocolar: SOCIO_EXEMPLO },
  },
  "3": {
    atual: "protocolar",
    responsaveis: { elaborar: "Ana Souza", revisar: null, protocolar: "Ana Souza" },
  },
  "4": {
    atual: "revisar",
    responsaveis: { elaborar: SOCIO_EXEMPLO, revisar: "Ana Souza", protocolar: SOCIO_EXEMPLO },
  },
};

export const divisaoAreasExemplo: Record<string, string> = {
  "Cível e consumidor": "",
  Trabalhista: SOCIO_EXEMPLO,
  Previdenciário: "Ana Souza",
  Família: "Ana Souza",
};

export const membrosEquipeExemplo = [
  { id: "1", nome: "Ana Souza", papel: "Titular" },
  { id: "2", nome: SOCIO_EXEMPLO, papel: "Sócio" },
];
