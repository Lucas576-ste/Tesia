export {
  gerarPeca,
  montarPedidoGeracao,
  type EntradaGeracao,
  type ResultadoGeracao,
  type TrechoReferencia,
} from "./gerar-peca.js";
export { pontosSemPrazo } from "./pontos.js";
export { acharPendencias, separarSecoes, type Pendencia, type SecaoPeca } from "./secoes.js";
export {
  ajustarPeca,
  juntarSecoes,
  montarPedidoAjuste,
  separarSecoesAlteradas,
  type ResultadoAjuste,
  type SecaoAlterada,
} from "./ajuste.js";
export {
  marcarMencaoDePrazo,
  marcarProblemas,
  revisarCitacoes,
  type ProblemaCitacao,
} from "./revisao.js";
