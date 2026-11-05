export type PecaExemplo = {
  id: string;
  tipo: string;
  partes: string;
  cnj: string;
  vencimento: string;
  conteudo: string;
  pecasBase: string[];
  documentos: string[];
};

const pecas: PecaExemplo[] = [
  {
    id: "1",
    tipo: "Contestação",
    partes: "Banco X x Maria Souza",
    cnj: "0000000-00.2026.8.07.0001",
    vencimento: "06/11/2026",
    pecasBase: ["Contestação em ação de cobrança (2025).pdf", "Contestação bancária (2024).docx"],
    documentos: ["Decisão disponibilizada em 14/10/2026", "Faturas juntadas pelo autor"],
    conteudo: `
      <h2>CONTESTAÇÃO</h2>
      <p>Processo nº 0000000-00.2026.8.07.0001</p>
      <p>MARIA SOUZA, já qualificada nos autos, por seu advogado, vem apresentar CONTESTAÇÃO à ação de cobrança ajuizada por BANCO X, pelos fundamentos a seguir.</p>
      <h3>Dos fatos</h3>
      <p>O autor cobra dívida de cartão de crédito. A ação foi ajuizada em 10/09/2026, com base em faturas, a última delas vencida em março de 2021 [CONFIRMAR: data exata de vencimento da última fatura].</p>
      <h3>Da ausência do contrato</h3>
      <p>A inicial não veio acompanhada do contrato assinado pela ré. Cabe ao autor provar o fato constitutivo do seu direito (CPC, art. 373, I) [CONFIRMAR: conferir na fonte oficial].</p>
      <h3>Da prescrição</h3>
      <p>Entre o vencimento da última fatura e o ajuizamento passaram-se mais de cinco anos, o que atrai a prescrição da pretensão de cobrança (Código Civil, art. 206, §5º, I) [CONFIRMAR: conferir na fonte oficial e a aplicação ao caso].</p>
      <h3>Do pedido</h3>
      <p>Requer o reconhecimento da prescrição ou, subsidiariamente, a improcedência do pedido.</p>
      <p>Nestes termos, pede deferimento.</p>
      <p>[CONFIRMAR: local, data, nome e OAB do advogado]</p>
    `,
  },
  {
    id: "2",
    tipo: "Manifestação sobre cálculos",
    partes: "João Lima x Construtora Y",
    cnj: "0000001-00.2026.5.10.0002",
    vencimento: "04/11/2026",
    pecasBase: ["Impugnação a cálculos (2025).docx"],
    documentos: ["Despacho disponibilizado em 21/10/2026", "Planilha de cálculos de liquidação"],
    conteudo: `
      <h2>MANIFESTAÇÃO SOBRE CÁLCULOS</h2>
      <p>Processo nº 0000001-00.2026.5.10.0002</p>
      <p>CONSTRUTORA Y, já qualificada nos autos, por seu advogado, vem se manifestar sobre os cálculos de liquidação apresentados, pelos fundamentos a seguir.</p>
      <h3>Dos juros</h3>
      <p>Os cálculos contam juros desde 01/2024, antes do ajuizamento da ação, ocorrido em 06/2024 [CONFIRMAR: regra de juros aplicável e data de início].</p>
      <h3>Das horas extras</h3>
      <p>A planilha inclui horas extras de janeiro a março de 2023, mas o título executivo as reconhece apenas a partir de abril de 2023.</p>
      <h3>Do pedido</h3>
      <p>Requer a retificação dos cálculos, com a exclusão dos valores acima [CONFIRMAR: valor correto após a retificação].</p>
      <p>Nestes termos, pede deferimento.</p>
      <p>[CONFIRMAR: local, data, nome e OAB do advogado]</p>
    `,
  },
];

const porId = new Map(pecas.map((peca) => [peca.id, peca]));

export function buscarPeca(id: string) {
  return porId.get(id);
}
