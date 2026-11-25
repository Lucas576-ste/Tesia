import type { TipoPublicacao } from "@tesia/shared";

export type TipoTermo = "advogado" | "pf" | "pj";

export type Termo = {
  id: string;
  escritorio_id: string;
  responsavel_id: string | null;
  tipo: TipoTermo;
  oab_numero: string | null;
  oab_uf: string | null;
  documento: string | null;
  nome: string | null;
  ufs: string[];
};

export type PublicacaoExterna = {
  idExterno: number | null;
  fonte: "diario" | "eletronico";
  tribunal: string | null;
  uf: string | null;
  tipoPublicacao: string | null;
  classificacao: TipoPublicacao;
  numeroProcesso: string | null;
  texto: string;
  publicadaEm: string;
  hash: string;
};

export class ProvedorNaoIntegrado extends Error {}
export class FalhaAutenticacao extends Error {}

export interface ProvedorPublicacoes {
  buscar(termo: Termo, de: string, ate: string): Promise<PublicacaoExterna[]>;
}
