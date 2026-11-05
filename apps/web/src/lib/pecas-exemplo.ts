import { chaveData } from "@/lib/prazo";

export type StatusPeca = "rascunho_pronto" | "protocolado";

export type PecaExemplo = {
  id: string;
  processoId: string;
  tipo: string;
  area: string;
  data: string;
  status: StatusPeca;
  listada: boolean;
  partes: string;
  cnj: string;
  vencimento: string | null;
  conteudo: string;
  pecasBase: string[];
  documentos: string[];
};

const pecas: PecaExemplo[] = [
  {
    id: "1",
    processoId: "1",
    tipo: "Contestação",
    area: "Cível e consumidor",
    data: "05/11/2026",
    status: "rascunho_pronto",
    listada: false,
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
    processoId: "2",
    tipo: "Manifestação sobre cálculos",
    area: "Trabalhista",
    data: "04/11/2026",
    status: "rascunho_pronto",
    listada: false,
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
  {
    id: "3",
    processoId: "3",
    tipo: "Recurso inominado",
    area: "Previdenciário",
    data: "03/11/2026",
    status: "rascunho_pronto",
    listada: true,
    partes: "Carla Dias x INSS",
    cnj: "0000002-00.2026.4.01.3400",
    vencimento: "16/11/2026",
    pecasBase: ["Recurso inominado previdenciário (2025).docx"],
    documentos: ["Sentença de improcedência", "Laudo pericial"],
    conteudo: `
      <h2>RECURSO INOMINADO</h2>
      <p>Processo nº 0000002-00.2026.4.01.3400</p>
      <p>CARLA DIAS, já qualificada nos autos, por seu advogado, vem interpor RECURSO INOMINADO contra a sentença, pelos fundamentos abaixo.</p>
      <h3>Da decisão recorrida</h3>
      <p>A sentença julgou improcedente o pedido [CONFIRMAR: resumo do fundamento da sentença].</p>
      <h3>Das razões do recurso</h3>
      <p>O laudo pericial deve ser reexaminado [CONFIRMAR: trecho do laudo e argumento].</p>
      <h3>Do pedido</h3>
      <p>Requer a reforma da sentença.</p>
      <p>Nestes termos, pede deferimento.</p>
      <p>[CONFIRMAR: local, data, nome e OAB do advogado]</p>
    `,
  },
  {
    id: "4",
    processoId: "4",
    tipo: "Apelação",
    area: "Cível e consumidor",
    data: "03/11/2026",
    status: "rascunho_pronto",
    listada: true,
    partes: "Paulo Araújo x Seguradora Z",
    cnj: "0000003-00.2026.8.07.0003",
    vencimento: "05/11/2026",
    pecasBase: ["Apelação contra seguradora (2024).pdf"],
    documentos: ["Sentença", "Apólice do seguro"],
    conteudo: `
      <h2>APELAÇÃO</h2>
      <p>Processo nº 0000003-00.2026.8.07.0003</p>
      <p>PAULO ARAÚJO, já qualificado nos autos, por seu advogado, vem interpor APELAÇÃO contra a sentença, pelos fundamentos abaixo.</p>
      <h3>Da decisão recorrida</h3>
      <p>A sentença afastou a cobertura prevista na apólice [CONFIRMAR: cláusula e fundamento da sentença].</p>
      <h3>Das razões do recurso</h3>
      <p>A apólice juntada aos autos deve ser reexaminada [CONFIRMAR: argumento e fundamento legal].</p>
      <h3>Do pedido</h3>
      <p>Requer a reforma da sentença.</p>
      <p>Nestes termos, pede deferimento.</p>
      <p>[CONFIRMAR: local, data, nome e OAB do advogado]</p>
    `,
  },
  {
    id: "5",
    processoId: "5",
    tipo: "Recurso ordinário",
    area: "Trabalhista",
    data: "30/10/2026",
    status: "protocolado",
    listada: true,
    partes: "Beatriz Melo x Comércio W",
    cnj: "0000004-00.2026.5.10.0005",
    vencimento: "03/11/2026",
    pecasBase: ["Recurso ordinário (2025).docx"],
    documentos: ["Sentença", "Controles de ponto"],
    conteudo: `
      <h2>RECURSO ORDINÁRIO</h2>
      <p>Processo nº 0000004-00.2026.5.10.0005</p>
      <p>BEATRIZ MELO, já qualificada nos autos, por seu advogado, vem interpor RECURSO ORDINÁRIO contra a sentença.</p>
      <h3>Das razões do recurso</h3>
      <p>Os controles de ponto juntados aos autos devem ser reexaminados.</p>
      <h3>Do pedido</h3>
      <p>Requer a reforma da sentença.</p>
      <p>Nestes termos, pede deferimento.</p>
    `,
  },
  {
    id: "6",
    processoId: "3",
    tipo: "Petição inicial",
    area: "Previdenciário",
    data: "15/06/2026",
    status: "protocolado",
    listada: true,
    partes: "Carla Dias x INSS",
    cnj: "0000002-00.2026.4.01.3400",
    vencimento: null,
    pecasBase: ["Petição inicial previdenciária (2025).docx"],
    documentos: ["Documentos pessoais da autora", "Decisão administrativa"],
    conteudo: `
      <h2>PETIÇÃO INICIAL</h2>
      <p>CARLA DIAS, por seu advogado, vem propor ação em face do INSS, pelos fatos a seguir.</p>
      <h3>Dos fatos</h3>
      <p>A autora teve seu pedido negado na via administrativa.</p>
      <h3>Do pedido</h3>
      <p>Requer a procedência do pedido.</p>
      <p>Nestes termos, pede deferimento.</p>
    `,
  },
  {
    id: "7",
    processoId: "4",
    tipo: "Réplica",
    area: "Cível e consumidor",
    data: "18/08/2026",
    status: "protocolado",
    listada: true,
    partes: "Paulo Araújo x Seguradora Z",
    cnj: "0000003-00.2026.8.07.0003",
    vencimento: "20/08/2026",
    pecasBase: ["Réplica (2025).docx"],
    documentos: ["Contestação da seguradora"],
    conteudo: `
      <h2>RÉPLICA</h2>
      <p>Processo nº 0000003-00.2026.8.07.0003</p>
      <p>PAULO ARAÚJO, já qualificado nos autos, por seu advogado, vem se manifestar sobre a contestação apresentada.</p>
      <h3>Da contestação</h3>
      <p>A contestação não afasta o direito à cobertura prevista na apólice.</p>
      <p>Nestes termos, pede deferimento.</p>
    `,
  },
];

const porId = new Map(pecas.map((peca) => [peca.id, peca]));

export function buscarPeca(id: string) {
  return porId.get(id);
}

export type LinhaPeca = Omit<PecaExemplo, "conteudo" | "pecasBase" | "documentos" | "listada">;

export function listarPecas(): LinhaPeca[] {
  return pecas
    .filter(({ listada }) => listada)
    .map(({ id, processoId, tipo, area, data, status, partes, cnj, vencimento }) => ({
      id,
      processoId,
      tipo,
      area,
      data,
      status,
      partes,
      cnj,
      vencimento,
    }))
    .sort((a, b) => chaveData(b.data).localeCompare(chaveData(a.data)));
}
