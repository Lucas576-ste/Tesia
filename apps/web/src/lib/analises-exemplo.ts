export type TrechoDocumento = { id: string; texto: string };

export type Analise = {
  id: string;
  cnj: string;
  orgao: string;
  partes: string;
  resumo: string;
  pontos: { titulo: string; trechoId: string }[];
  prazo: {
    vencimentoIso: string;
    dias: number;
    contagem: string;
    fundamento: string;
    memoria: string[];
  };
  pecas: { nome: string; justificativa: string }[];
  documento: TrechoDocumento[];
};

const analises: Analise[] = [
  {
    id: "1",
    cnj: "0000000-00.2026.8.07.0001",
    orgao: "2ª Vara Cível de Brasília (TJDFT)",
    partes: "Banco X x Maria Souza",
    resumo:
      "O Banco X cobra de Maria Souza uma dívida de cartão de crédito. O juiz abriu prazo para Maria apresentar contestação. Ainda não há decisão sobre o mérito.",
    pontos: [
      { titulo: "Contrato não juntado aos autos", trechoId: "contrato" },
      { titulo: "Possível prescrição: última fatura de março de 2021", trechoId: "fatura" },
    ],
    prazo: {
      vencimentoIso: "2026-11-06",
      dias: 15,
      contagem: "úteis",
      fundamento: "CPC, art. 335",
      memoria: [
        "Disponibilizado no diário: 14/10/2026 (quarta)",
        "Publicação: 15/10/2026 (primeiro dia útil seguinte)",
        "Início da contagem: 16/10/2026",
        "Prazo: 15 dias úteis (CPC, art. 335)",
        "Dias não úteis no período: sábados, domingos e o feriado de 02/11",
        "Vencimento: 06/11/2026 (sexta)",
      ],
    },
    pecas: [
      {
        nome: "Contestação",
        justificativa: "É a resposta cabível para a ré depois da abertura do prazo.",
      },
      {
        nome: "Manifestação simples",
        justificativa: "Serve para um pedido pontual, sem responder à ação inteira.",
      },
    ],
    documento: [
      {
        id: "inicio",
        texto:
          "DECISÃO. Trata-se de ação de cobrança ajuizada por Banco X em 10/09/2026 contra Maria Souza, referente a dívida de cartão de crédito.",
      },
      {
        id: "contrato",
        texto: "A inicial vem instruída apenas com faturas, sem o contrato assinado pela ré.",
      },
      { id: "fatura", texto: "A última fatura indicada venceu em março de 2021." },
      {
        id: "ordem",
        texto:
          "Tendo a ré comparecido aos autos por advogado, intime-se para apresentar contestação no prazo legal.",
      },
    ],
  },
  {
    id: "2",
    cnj: "0000001-00.2026.5.10.0002",
    orgao: "5ª Vara do Trabalho de Brasília (TRT10)",
    partes: "João Lima x Construtora Y",
    resumo:
      "Foram apresentados os cálculos do que a Construtora Y deve a João Lima. O juiz abriu prazo para as partes se manifestarem sobre eles. Quem não se manifestar perde a chance de discutir os valores nessa fase.",
    pontos: [
      { titulo: "Juros contados antes do ajuizamento", trechoId: "juros" },
      { titulo: "Horas extras em período sem condenação", trechoId: "horas" },
    ],
    prazo: {
      vencimentoIso: "2026-11-04",
      dias: 8,
      contagem: "úteis",
      fundamento: "CLT, art. 879, §2º",
      memoria: [
        "Disponibilizado no diário: 21/10/2026 (quarta)",
        "Publicação: 22/10/2026 (primeiro dia útil seguinte)",
        "Início da contagem: 23/10/2026",
        "Prazo: 8 dias úteis (CLT, art. 879, §2º)",
        "Dias não úteis no período: sábados, domingos e o feriado de 02/11",
        "Vencimento: 04/11/2026 (quarta)",
      ],
    },
    pecas: [
      {
        nome: "Manifestação sobre cálculos",
        justificativa: "É a resposta prevista para impugnar os valores apresentados.",
      },
      {
        nome: "Manifestação simples",
        justificativa: "Serve se você só quiser concordar com os cálculos.",
      },
    ],
    documento: [
      {
        id: "inicio",
        texto:
          "DESPACHO. Apresentados os cálculos de liquidação, ficam as partes intimadas para manifestação no prazo legal, sob pena de preclusão.",
      },
      {
        id: "juros",
        texto: "Os juros foram calculados desde 01/2024, e a ação foi ajuizada em 06/2024.",
      },
      {
        id: "horas",
        texto: "A planilha inclui horas extras de janeiro a março de 2023.",
      },
      {
        id: "titulo",
        texto: "O título executivo reconhece horas extras apenas a partir de abril de 2023.",
      },
    ],
  },
];

const porId = new Map(analises.map((analise) => [analise.id, analise]));

export function buscarAnalise(id: string) {
  return porId.get(id);
}
