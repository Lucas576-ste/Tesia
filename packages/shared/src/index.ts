export {
  formatarTelefone,
  mascararEmail,
  mascararNome,
  mascararOab,
  mascararTelefone,
} from "./mascara";
export {
  analiseGravadaSchema,
  memoriaCalculoSchema,
  nomePartes,
  type AnaliseGravada,
  type MemoriaCalculo,
} from "./analise";
export { PECA_EXEMPLO } from "./peca-exemplo";
export {
  idAprendizado,
  NIVEIS_ESTILO,
  nivelEstilo,
  PARTES_APRENDIZADO,
  perfilEstiloSchema,
  perfilGravadoSchema,
  proximaAcaoEstilo,
  ROTULOS_PARTE,
  type NivelEstilo,
  type ParteAprendizado,
  type PerfilEstilo,
  type PerfilGravado,
} from "./estilo";
export {
  conteudoPecaSchema,
  documentoDoConteudo,
  documentoParaSecoes,
  documentoSchema,
  pendenciasDoDocumento,
  secoesParaDocumento,
  TAMANHO_MAXIMO_DOCUMENTO,
  textoDoNo,
  type NoDocumento,
  type SecaoDocumento,
} from "./documento";
export {
  ETAPAS,
  etapaDaFase,
  faseDoAto,
  faseDoProcesso,
  fasesDoRito,
  normalizarNome,
  type CodigoEtapa,
  type Fase,
} from "./fases";
export {
  contarUrgencias,
  LIMITE_DIAS_URGENTES,
  pesoUrgencia,
  textoUrgencia,
  urgencia,
  type EntradaUrgencia,
  type NivelUrgencia,
} from "./urgencia";
export {
  mascararCnpj,
  mascararCpf,
  mascararDocumento,
  somenteDigitos,
  validarCnpj,
  validarCpf,
} from "./cpf-cnpj";
export {
  camposFaltando,
  enderecoSchema,
  ESTADOS_CIVIS,
  qualificacaoSchema,
  textoQualificacao,
  type ClienteQualificavel,
  type Qualificacao,
} from "./qualificacao";
export { iniciais, tituloNome } from "./nomes";
export {
  CODIGOS_GENERO,
  CODIGOS_ORIGEM,
  CODIGOS_PAPEL,
  extrairHashtags,
  GENEROS,
  mascaraTelefoneEntrada,
  ORIGENS,
  PAPEIS,
  papelDaOrigem,
  validarCelular,
  type GeneroCliente,
  type OrigemCliente,
  type PapelCliente,
} from "./clientes";
