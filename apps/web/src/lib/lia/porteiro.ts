export const MENSAGEM_JURIDICA =
  "Nesta versão eu ajudo com o uso da Tesia e com o que está na sua tela. Para dúvidas jurídicas, confira nas fontes oficiais.";

export const RESPOSTA_JURIDICA = `${MENSAGEM_JURIDICA}

Posso ajudar com:
- [Como o prazo é calculado](/app/prazos)
- [Ler uma intimação e sugerir a peça](/app/intimacoes)
- [Ajustar o que a Lia aprendeu sobre você](/app/estilo)`;

const PADROES = [
  /\b(melhor|qual|quais|existe|existem|ha|tem|cabe)\b.{0,40}\b(tese|teses|jurisprudencia|precedente|precedentes|sumula|sumulas)\b/,
  /\b(tese|teses|jurisprudencia|precedente|precedentes|sumula|sumulas)\b.{0,25}\b(sobre|para|contra|a favor)\b/,
];

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function perguntaJuridicaAberta(texto: string) {
  const alvo = normalizar(texto);
  return PADROES.some((padrao) => padrao.test(alvo));
}
