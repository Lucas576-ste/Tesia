import { z } from "zod";
import { PLANOS_DEMO, type IdPlanoDemo } from "@/lib/planos-exemplo";

export type IdPlano = IdPlanoDemo;

export type EstadoPlano = {
  id: IdPlano;
  teste: boolean;
  fimPeriodo: string | null;
  plano: {
    nome: string;
    preco: string;
    limite: number;
    pacote: string;
    maxAreas: number | null;
    equipe: boolean;
    recursosPro: boolean;
  };
  uso: { usadas: number; limite: number };
};

export const idSchema = z.enum(["start", "pro", "fundador", "sociedade"]).catch("start");

export function dadosDoPlano(id: IdPlano): EstadoPlano["plano"] {
  const { nome, preco, limite, pacote, maxAreas, equipe, recursosPro } = PLANOS_DEMO[id];
  return { nome, preco, limite, pacote, maxAreas, equipe, recursosPro };
}

export function estadoPadrao(): EstadoPlano {
  const plano = dadosDoPlano("start");
  return {
    id: "start",
    teste: false,
    fimPeriodo: null,
    plano,
    uso: { usadas: 0, limite: plano.limite },
  };
}
