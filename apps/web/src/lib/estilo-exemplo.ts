export const MINIMO_PECAS_ESTILO = 5;
export const MAXIMO_PECAS_ESTILO = 10;
export const FORMATOS_PECA_ESTILO = /\.(pdf|docx?)$/i;

export type PecaEstilo = {
  id: string;
  nome: string;
  data: string;
};

export const pecasEstiloExemplo: PecaEstilo[] = [
  { id: "1", nome: "contestacao-consumidor.docx", data: "12/10/2026" },
  { id: "2", nome: "apelacao-civel.pdf", data: "12/10/2026" },
  { id: "3", nome: "recurso-ordinario.docx", data: "12/10/2026" },
  { id: "4", nome: "manifestacao-calculos.docx", data: "12/10/2026" },
  { id: "5", nome: "recurso-inominado.pdf", data: "12/10/2026" },
  { id: "6", nome: "contrarrazoes.docx", data: "20/10/2026" },
];
