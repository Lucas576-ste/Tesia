import { ProvedorNaoIntegrado, type ProvedorPublicacoes, type PublicacaoExterna } from "./tipos.js";

function naoIntegrado(sistema: string): ProvedorPublicacoes {
  return {
    async buscar(): Promise<PublicacaoExterna[]> {
      throw new ProvedorNaoIntegrado(`A integração com o ${sistema} ainda não está disponível`);
    },
  };
}

export const provedorPje = naoIntegrado("PJe");
export const provedorEproc = naoIntegrado("Eproc");
export const provedorProjudi = naoIntegrado("Projudi");
