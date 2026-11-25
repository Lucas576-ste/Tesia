import { ProvedorDjen } from "./djen.js";
import { provedorEproc, provedorPje, provedorProjudi } from "./stubs.js";
import type { ProvedorPublicacoes } from "./tipos.js";

const djen = new ProvedorDjen();

export const provedores = {
  djen,
  pje: provedorPje,
  eproc: provedorEproc,
  projudi: provedorProjudi,
};

export function provedorDoTermo(): ProvedorPublicacoes {
  return djen;
}
