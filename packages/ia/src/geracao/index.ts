export {
  gerarPeca,
  montarPedidoGeracao,
  type EntradaGeracao,
  type ResultadoGeracao,
  type TrechoReferencia,
} from "./gerar-peca.js";
export { acharPendencias, separarSecoes, type Pendencia, type SecaoPeca } from "./secoes.js";
export {
  ajustarPeca,
  juntarSecoes,
  montarPedidoAjuste,
  separarSecoesAlteradas,
  type ResultadoAjuste,
  type SecaoAlterada,
} from "./ajuste.js";
export { marcarProblemas, revisarCitacoes, type ProblemaCitacao } from "./revisao.js";
