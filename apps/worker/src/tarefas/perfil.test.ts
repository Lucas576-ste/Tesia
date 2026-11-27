import { montarPedidoAjuste, montarPedidoGeracao } from "@tesia/ia";
import { describe, expect, it } from "vitest";
import { lerPerfil } from "./perfil.js";

const antigo = {
  estrutura_por_tipo: [],
  tom: "Direto e respeitoso",
  tamanho_frases: "curtas",
  citacao_lei: "No corpo do texto",
  citacao_jurisprudencia: "Em bloco recuado",
  referencias_frequentes: [],
  abertura: "Excelentíssimo Senhor Juiz",
  fechamento: "Nestes termos, pede deferimento",
  expressoes_tipicas: ["ante o exposto"],
  frases_exibicao: [],
};

describe("lerPerfil", () => {
  it("aceita o perfil antigo, sem aprendizados", () => {
    expect(lerPerfil(antigo)).toEqual({ ...antigo, aprendizados: [] });
  });

  it("recusa perfil vazio, ausente ou incompleto", () => {
    expect(lerPerfil({})).toBeNull();
    expect(lerPerfil(null)).toBeNull();
    expect(lerPerfil({ tom: "Direto" })).toBeNull();
  });

  it("leva o perfil antigo para os pedidos de geração e de ajuste", () => {
    const perfil = lerPerfil(antigo);
    const geracao = montarPedidoGeracao({
      peca: { nome: "Apelação", estrutura: ["fatos"], instrucoes: null },
      perfil,
      trechos: [],
      dados: {},
      textoIntimacao: "Intimação",
      pontosAtacar: [],
      qualificacaoCliente: null,
      advogado: null,
      tamanhoReferencia: null,
    });
    const ajuste = montarPedidoAjuste([], "Encurte os fatos", perfil);
    expect(JSON.stringify(geracao)).toContain(antigo.tom);
    expect(JSON.stringify(ajuste)).toContain(antigo.tom);
  });
});
