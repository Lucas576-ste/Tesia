import type { ParteAprendizado, PerfilGravado } from "@tesia/shared";

export type EstadoPerfil =
  { estado: "vazio" } | { estado: "atualizando"; anterior: PerfilPronto | null } | PerfilPronto;

export type ItemAprendizado = {
  id: string;
  texto: string;
  avaliacao: "certo" | "errado" | null;
  correcao: string | null;
};

export type GrupoAprendizado = { parte: ParteAprendizado; itens: ItemAprendizado[] };

export type PerfilPronto = {
  estado: "pronto";
  frases: string[];
  pecas: number;
  atualizadoEm: string | null;
  detalhes: PerfilGravado | null;
  aprendizados: GrupoAprendizado[];
};
