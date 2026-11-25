import { classificarPublicacao, htmlParaTexto, normalizarCnj } from "@tesia/shared";
import { buscarComunicacoes } from "../djen/cliente.js";
import { eDoAdvogado, type Comunicacao } from "../djen/filtrar.js";
import { hashPublicacao, ufDoTribunal } from "./hash.js";
import type { ProvedorPublicacoes, PublicacaoExterna, Termo } from "./tipos.js";

type Dependencias = { buscar?: typeof fetch; esperar?: (ms: number) => Promise<void> };

function paraPublicacao(comunicacao: Comunicacao): PublicacaoExterna {
  const texto = htmlParaTexto(comunicacao.texto ?? "");
  const numeroProcesso = normalizarCnj(comunicacao.numero_processo);
  const tribunal = comunicacao.siglaTribunal ?? null;
  return {
    idExterno: comunicacao.id,
    fonte: "diario",
    tribunal,
    uf: ufDoTribunal(tribunal),
    tipoPublicacao: comunicacao.tipoDocumento ?? comunicacao.tipoComunicacao ?? null,
    classificacao: classificarPublicacao({
      tipoDocumento: comunicacao.tipoDocumento,
      texto: comunicacao.texto,
    }),
    numeroProcesso,
    texto,
    publicadaEm: comunicacao.data_disponibilizacao,
    hash: hashPublicacao({
      tribunal,
      numeroProcesso,
      publicadaEm: comunicacao.data_disponibilizacao,
      texto,
    }),
  };
}

function valida(comunicacao: Comunicacao) {
  return comunicacao.ativo && !comunicacao.data_cancelamento && !!comunicacao.texto?.trim();
}

export class ProvedorDjen implements ProvedorPublicacoes {
  constructor(private readonly dependencias: Dependencias = {}) {}

  async buscar(termo: Termo, de: string, ate: string) {
    const comunicacoes =
      termo.tipo === "advogado"
        ? (
            await buscarComunicacoes({
              oab: termo.oab_numero ?? "",
              uf: termo.oab_uf ?? "",
              de,
              ate,
              ...this.dependencias,
            })
          ).filter((item) => eDoAdvogado(item, termo.oab_numero ?? "", termo.oab_uf ?? ""))
        : (
            await buscarComunicacoes({ nomeParte: termo.nome ?? "", de, ate, ...this.dependencias })
          ).filter(valida);
    const publicacoes = comunicacoes.map(paraPublicacao);
    if (termo.ufs.length === 0) return publicacoes;
    return publicacoes.filter(({ uf }) => uf === null || termo.ufs.includes(uf));
  }
}
