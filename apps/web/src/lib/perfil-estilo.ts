import type { PerfilEstilo } from "@tesia/shared";

export type EstadoPerfil =
  { estado: "vazio" } | { estado: "atualizando"; anterior: PerfilPronto | null } | PerfilPronto;

export type PerfilPronto = {
  estado: "pronto";
  frases: string[];
  pecas: number;
  detalhes: PerfilEstilo | null;
};
