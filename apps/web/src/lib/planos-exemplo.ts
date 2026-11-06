import { z } from "zod";

export const mostrarSeletorPlano = process.env.NODE_ENV === "development";

export const COOKIE_PLANO_DEMO = "tesia-plano-demo";
export const COOKIE_USO_DEMO = "tesia-uso-demo";

export const PLANOS_DEMO = {
  start: {
    nome: "Start",
    preco: "R$ 79/mês",
    limite: 15,
    usadas: 9,
    maxAreas: 1,
    equipe: false,
    recursosPro: false,
  },
  pro: {
    nome: "Pro",
    preco: "R$ 129/mês",
    limite: 50,
    usadas: 32,
    maxAreas: null,
    equipe: false,
    recursosPro: true,
  },
  fundador: {
    nome: "Cliente Fundador",
    preco: "R$ 79/mês",
    limite: 50,
    usadas: 32,
    maxAreas: null,
    equipe: false,
    recursosPro: true,
  },
  sociedade: {
    nome: "Sociedade",
    preco: "R$ 219/mês",
    limite: 100,
    usadas: 64,
    maxAreas: null,
    equipe: true,
    recursosPro: true,
  },
} as const;

export const NIVEIS_USO = { normal: "Normal", "80": "80%", "100": "100%" } as const;

export type IdPlanoDemo = keyof typeof PLANOS_DEMO;
export type NivelUso = keyof typeof NIVEIS_USO;

const planoDemoSchema = z.enum(["start", "pro", "fundador", "sociedade"]).catch("fundador");
const nivelUsoSchema = z.enum(["normal", "80", "100"]).catch("normal");

export type EstadoPlanoDemo = {
  id: IdPlanoDemo;
  nivelUso: NivelUso;
  plano: (typeof PLANOS_DEMO)[IdPlanoDemo];
  uso: { usadas: number; limite: number };
};

function calcularUsadas(limite: number, usadas: number, nivel: NivelUso) {
  if (nivel === "normal") return usadas;
  return Math.round((limite * Number(nivel)) / 100);
}

export function montarEstadoPlano(plano?: string, nivel?: string): EstadoPlanoDemo {
  const id = planoDemoSchema.parse(plano);
  const nivelUso = nivelUsoSchema.parse(nivel);
  const dados = PLANOS_DEMO[id];
  return {
    id,
    nivelUso,
    plano: dados,
    uso: {
      usadas: calcularUsadas(dados.limite, dados.usadas, nivelUso),
      limite: dados.limite,
    },
  };
}

export const responsaveisExemplo: Record<string, string> = {
  "2": "Bruno Lima",
  "4": "Bruno Lima",
};

export const membrosEquipeExemplo = [
  { id: "1", nome: "Ana Souza", papel: "Dono" },
  { id: "2", nome: "Bruno Lima", papel: "Sócio" },
];
