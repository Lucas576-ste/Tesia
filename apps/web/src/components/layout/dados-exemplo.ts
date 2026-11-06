import type { LinhaPrazo } from "@/lib/prazo";

export const advogadoExemplo = {
  nome: "Ana Souza",
  oab: "OAB/DF 00.000",
};

export const processosExemplo = [
  { id: "1", cnj: "0000000-00.2026.8.07.0001", partes: "Banco X x Maria Souza" },
  { id: "2", cnj: "0000001-00.2026.5.10.0002", partes: "João Lima x Construtora Y" },
  { id: "3", cnj: "0000002-00.2026.4.01.3400", partes: "Carla Dias x INSS" },
  { id: "4", cnj: "0000003-00.2026.8.07.0003", partes: "Paulo Araújo x Seguradora Z" },
  { id: "5", cnj: "0000004-00.2026.5.10.0005", partes: "Beatriz Melo x Comércio W" },
];

export const prazosExemplo: LinhaPrazo[] = [
  {
    id: "2",
    partes: "João Lima x Construtora Y",
    cnj: "0000001-00.2026.5.10.0002",
    peca: "Manifestação sobre cálculos",
    area: "Trabalhista",
    vencimento: "04/11/2026",
    diasUteis: 0,
    status: "nao_iniciado",
  },
  {
    id: "4",
    partes: "Paulo Araújo x Seguradora Z",
    cnj: "0000003-00.2026.8.07.0003",
    peca: "Apelação",
    area: "Cível e consumidor",
    vencimento: "05/11/2026",
    diasUteis: 1,
    status: "rascunho_pronto",
  },
  {
    id: "1",
    partes: "Banco X x Maria Souza",
    cnj: "0000000-00.2026.8.07.0001",
    peca: "Contestação",
    area: "Cível e consumidor",
    vencimento: "06/11/2026",
    diasUteis: 2,
    status: "nao_iniciado",
  },
  {
    id: "3",
    partes: "Carla Dias x INSS",
    cnj: "0000002-00.2026.4.01.3400",
    peca: "Recurso inominado",
    area: "Previdenciário",
    vencimento: "16/11/2026",
    diasUteis: 8,
    status: "rascunho_pronto",
  },
  {
    id: "5",
    partes: "Beatriz Melo x Comércio W",
    cnj: "0000004-00.2026.5.10.0005",
    peca: "Recurso ordinário",
    area: "Trabalhista",
    vencimento: "03/11/2026",
    diasUteis: 0,
    status: "protocolado",
  },
];
