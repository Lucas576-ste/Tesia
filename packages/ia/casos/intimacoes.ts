import type { OpcaoPeca } from "../src/analise/escolha-peca.js";

export type CasoAvaliacao = {
  nome: string;
  texto: string;
  opcoes: OpcaoPeca[];
  esperado: {
    numero_processo: string;
    tipo_ato: string;
    forma_intimacao: string;
    data_disponibilizacao: string | null;
    data_envio_portal: string | null;
    peca: string;
  };
};

export const CASOS: CasoAvaliacao[] = [
  {
    nome: "Cível, sentença de improcedência",
    texto: `Diário de Justiça Eletrônico Nacional - Disponibilizado em 03/11/2026
TRIBUNAL DE JUSTIÇA DO DISTRITO FEDERAL E DOS TERRITÓRIOS
2ª Vara Cível de Brasília
Processo nº 0712345-67.2026.8.07.0001 - Procedimento Comum Cível
Autora: Ana Paula Ficticia. Réu: Banco Exemplo S.A.
Advogado(a) da autora: Fulano Teste (OAB/DF 00000)
SENTENÇA. Trata-se de ação declaratória de inexistência de débito cumulada com indenização por danos morais.
O réu comprovou a contratação por meio do contrato assinado e dos comprovantes de transferência juntados no ID 9876.
A autora não impugnou especificamente a assinatura lançada no contrato.
Ante o exposto, JULGO IMPROCEDENTES os pedidos, com resolução do mérito, nos termos do art. 487, I, do CPC.
Condeno a autora ao pagamento das custas e de honorários de 10% sobre o valor da causa, suspensa a exigibilidade em razão da gratuidade.
Intimem-se.`,
    opcoes: [
      { codigo: "apelacao", nome: "Apelação", dias: 15, fundamento: "CPC, art. 1.003, §5º" },
      {
        codigo: "embargos_declaracao",
        nome: "Embargos de declaração",
        dias: 5,
        fundamento: "CPC, art. 1.023",
      },
    ],
    esperado: {
      numero_processo: "0712345-67.2026.8.07.0001",
      tipo_ato: "sentenca",
      forma_intimacao: "diario",
      data_disponibilizacao: "2026-11-03",
      data_envio_portal: null,
      peca: "apelacao",
    },
  },
  {
    nome: "Previdenciário JEF, laudo pericial",
    texto: `JUSTIÇA FEDERAL - SEÇÃO JUDICIÁRIA DO DISTRITO FEDERAL
25ª Vara Federal - Juizado Especial Federal Cível
Processo 1023456-78.2026.4.01.3400
Autor: Joaquim Exemplo da Silva. Réu: Instituto Nacional do Seguro Social - INSS
ATO ORDINATÓRIO. Disponibilizado no DJEN em 05/11/2026.
Fica a parte autora intimada para, no prazo de 5 (cinco) dias, manifestar-se sobre o laudo pericial juntado aos autos.
Conclusão do perito: o autor, portador de lombalgia crônica, apresenta capacidade laborativa preservada para a função habitual de pedreiro.
O perito não respondeu ao quesito 4 da parte autora, sobre a necessidade de esforço físico intenso.`,
    opcoes: [
      {
        codigo: "manifestacao_laudo",
        nome: "Manifestação sobre laudo",
        dias: 5,
        fundamento: "Lei 10.259/2001 e CPC, art. 477, §1º",
      },
      { codigo: "manifestacao_simples", nome: "Manifestação simples", dias: 5 },
    ],
    esperado: {
      numero_processo: "1023456-78.2026.4.01.3400",
      tipo_ato: "laudo",
      forma_intimacao: "diario",
      data_disponibilizacao: "2026-11-05",
      data_envio_portal: null,
      peca: "manifestacao_laudo",
    },
  },
  {
    nome: "Trabalhista, sentença de procedência parcial",
    texto: `PODER JUDICIÁRIO - JUSTIÇA DO TRABALHO
TRIBUNAL REGIONAL DO TRABALHO DA 10ª REGIÃO
5ª Vara do Trabalho de Brasília
ATOrd 0000789-12.2026.5.10.0005
Reclamante: Carla Exemplo Souza. Reclamada: Comércio Fictício Ltda.
SENTENÇA. Reconhecido o vínculo de emprego no período de 01/02/2024 a 30/06/2026.
Julgo PROCEDENTES EM PARTE os pedidos para condenar a reclamada ao pagamento de aviso prévio, férias com 1/3 e 13º salário proporcionais.
Indefiro o pedido de horas extras, pois a reclamante não apresentou prova da jornada alegada, e o depoimento da testemunha foi considerado contraditório.
Intimem-se as partes.`,
    opcoes: [
      {
        codigo: "recurso_ordinario",
        nome: "Recurso ordinário",
        dias: 8,
        fundamento: "CLT, art. 895",
      },
      {
        codigo: "embargos_declaracao",
        nome: "Embargos de declaração",
        dias: 5,
        fundamento: "CLT, art. 897-A",
      },
    ],
    esperado: {
      numero_processo: "0000789-12.2026.5.10.0005",
      tipo_ato: "sentenca",
      forma_intimacao: "nao_identificada",
      data_disponibilizacao: null,
      data_envio_portal: null,
      peca: "recurso_ordinario",
    },
  },
  {
    nome: "Trabalhista, intimação pelo portal sobre cálculos",
    texto: `PJe - Processo Judicial Eletrônico - Tribunal Regional do Trabalho da 10ª Região
EXPEDIENTE - INTIMAÇÃO ELETRÔNICA
Destinatário: Advogado(a) Fulano Teste (OAB/DF 00000)
Data de expedição: 04/11/2026. Prazo para ciência: 10 dias.
Processo: ATSum 0000321-45.2026.5.10.0007 - 7ª Vara do Trabalho de Brasília
Reclamante: Marcos Exemplo Lima. Reclamada: Transportes Fictícios Ltda.
DESPACHO (assinado em 03/11/2026). Ficam as partes intimadas para, no prazo de 8 dias, manifestarem-se sobre os cálculos de liquidação apresentados pelo perito contábil.`,
    opcoes: [
      {
        codigo: "manifestacao_calculos",
        nome: "Manifestação sobre cálculos",
        dias: 8,
        fundamento: "CLT, art. 879, §2º",
      },
      { codigo: "manifestacao_simples", nome: "Manifestação simples" },
    ],
    esperado: {
      numero_processo: "0000321-45.2026.5.10.0007",
      tipo_ato: "calculos",
      forma_intimacao: "portal",
      data_disponibilizacao: null,
      data_envio_portal: "2026-11-04",
      peca: "manifestacao_calculos",
    },
  },
];
