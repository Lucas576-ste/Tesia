export const ETAPAS = [
  { codigo: "inicio", nome: "Início" },
  { codigo: "instrucao", nome: "Defesa e instrução" },
  { codigo: "sentenca", nome: "Sentença" },
  { codigo: "recurso", nome: "Recurso" },
  { codigo: "cumprimento", nome: "Cumprimento" },
  { codigo: "encerrado", nome: "Encerrado" },
] as const;

export type CodigoEtapa = (typeof ETAPAS)[number]["codigo"];

export type Fase = {
  codigo: string;
  nome: string;
  etapa: CodigoEtapa;
  proximo: string;
};

const comum: Fase[] = [
  {
    codigo: "inicial",
    nome: "Petição inicial",
    etapa: "inicio",
    proximo: "Aguardar a citação do réu.",
  },
  {
    codigo: "citacao",
    nome: "Citação",
    etapa: "inicio",
    proximo: "Prazo de defesa. Peça comum: contestação.",
  },
  {
    codigo: "contestacao",
    nome: "Contestação",
    etapa: "instrucao",
    proximo: "Manifestar sobre a defesa. Peça comum: réplica.",
  },
  {
    codigo: "replica",
    nome: "Réplica",
    etapa: "instrucao",
    proximo: "Aguardar o saneamento e a definição das provas.",
  },
  {
    codigo: "saneamento",
    nome: "Saneamento",
    etapa: "instrucao",
    proximo: "Indicar provas e preparar a instrução.",
  },
  {
    codigo: "instrucao",
    nome: "Instrução",
    etapa: "instrucao",
    proximo: "Audiência ou perícia; depois, alegações finais.",
  },
  {
    codigo: "sentenca",
    nome: "Sentença",
    etapa: "sentenca",
    proximo: "Recorrer ou deixar transitar. Peça comum: apelação.",
  },
  {
    codigo: "recurso",
    nome: "Recurso",
    etapa: "recurso",
    proximo: "Acompanhar o julgamento no tribunal; contrarrazões se a outra parte recorrer.",
  },
  {
    codigo: "transito",
    nome: "Trânsito em julgado",
    etapa: "cumprimento",
    proximo: "Pedir o cumprimento da sentença, se houver valor a receber.",
  },
  {
    codigo: "cumprimento",
    nome: "Cumprimento de sentença",
    etapa: "cumprimento",
    proximo: "Acompanhar pagamento, cálculos e penhora.",
  },
  { codigo: "arquivado", nome: "Arquivado", etapa: "encerrado", proximo: "Processo encerrado." },
];

const juizado: Fase[] = [
  {
    codigo: "inicial",
    nome: "Petição inicial",
    etapa: "inicio",
    proximo: "Aguardar a citação e a audiência de conciliação.",
  },
  {
    codigo: "citacao",
    nome: "Citação e conciliação",
    etapa: "inicio",
    proximo: "Preparar a audiência de conciliação.",
  },
  {
    codigo: "contestacao",
    nome: "Contestação",
    etapa: "instrucao",
    proximo: "Aguardar a instrução ou a sentença.",
  },
  {
    codigo: "instrucao",
    nome: "Instrução",
    etapa: "instrucao",
    proximo: "Audiência ou perícia; depois, sentença.",
  },
  {
    codigo: "sentenca",
    nome: "Sentença",
    etapa: "sentenca",
    proximo: "Recorrer à Turma Recursal ou deixar transitar. Peça comum: recurso inominado.",
  },
  {
    codigo: "recurso",
    nome: "Recurso inominado",
    etapa: "recurso",
    proximo: "Acompanhar o julgamento na Turma Recursal; contrarrazões se a outra parte recorrer.",
  },
  {
    codigo: "transito",
    nome: "Trânsito em julgado",
    etapa: "cumprimento",
    proximo: "Pedir o cumprimento, se houver valor a receber.",
  },
  {
    codigo: "cumprimento",
    nome: "Cumprimento",
    etapa: "cumprimento",
    proximo: "Acompanhar pagamento ou RPV.",
  },
  { codigo: "arquivado", nome: "Arquivado", etapa: "encerrado", proximo: "Processo encerrado." },
];

const trabalhista: Fase[] = [
  {
    codigo: "inicial",
    nome: "Reclamação",
    etapa: "inicio",
    proximo: "Aguardar a notificação e a audiência inicial.",
  },
  {
    codigo: "citacao",
    nome: "Audiência inicial",
    etapa: "inicio",
    proximo: "Preparar a audiência e a defesa.",
  },
  {
    codigo: "contestacao",
    nome: "Defesa",
    etapa: "instrucao",
    proximo: "Manifestar sobre a defesa e preparar a instrução.",
  },
  {
    codigo: "instrucao",
    nome: "Instrução",
    etapa: "instrucao",
    proximo: "Audiência de instrução; depois, razões finais.",
  },
  {
    codigo: "sentenca",
    nome: "Sentença",
    etapa: "sentenca",
    proximo: "Recorrer ao TRT ou deixar transitar. Peça comum: recurso ordinário.",
  },
  {
    codigo: "recurso",
    nome: "Recurso ordinário",
    etapa: "recurso",
    proximo: "Acompanhar o julgamento no TRT; contrarrazões se a outra parte recorrer.",
  },
  {
    codigo: "transito",
    nome: "Trânsito em julgado",
    etapa: "cumprimento",
    proximo: "Iniciar a liquidação.",
  },
  {
    codigo: "cumprimento",
    nome: "Liquidação e execução",
    etapa: "cumprimento",
    proximo: "Manifestar sobre cálculos e acompanhar a execução.",
  },
  { codigo: "arquivado", nome: "Arquivado", etapa: "encerrado", proximo: "Processo encerrado." },
];

const criminal: Fase[] = [
  {
    codigo: "inicial",
    nome: "Inquérito ou denúncia",
    etapa: "inicio",
    proximo: "Aguardar o recebimento da denúncia e a citação.",
  },
  {
    codigo: "citacao",
    nome: "Resposta à acusação",
    etapa: "inicio",
    proximo: "Prazo de 10 dias corridos. Peça comum: resposta à acusação.",
  },
  {
    codigo: "instrucao",
    nome: "Instrução",
    etapa: "instrucao",
    proximo: "Audiência de instrução e julgamento; depois, alegações finais.",
  },
  {
    codigo: "alegacoes",
    nome: "Alegações finais",
    etapa: "instrucao",
    proximo: "Memoriais e, depois, sentença.",
  },
  {
    codigo: "sentenca",
    nome: "Sentença",
    etapa: "sentenca",
    proximo: "Apelar em 5 dias corridos ou deixar transitar. Peça comum: apelação criminal.",
  },
  {
    codigo: "recurso",
    nome: "Recurso",
    etapa: "recurso",
    proximo: "Acompanhar o julgamento; contrarrazões se a outra parte recorrer.",
  },
  {
    codigo: "transito",
    nome: "Trânsito em julgado",
    etapa: "cumprimento",
    proximo: "Acompanhar a execução da pena.",
  },
  {
    codigo: "cumprimento",
    nome: "Execução penal",
    etapa: "cumprimento",
    proximo: "Pedidos de progressão, livramento e benefícios.",
  },
  { codigo: "arquivado", nome: "Arquivado", etapa: "encerrado", proximo: "Processo encerrado." },
];

export function fasesDoRito(rito: string | null | undefined): Fase[] {
  if (rito === "criminal") return criminal;
  if (rito === "jec" || rito === "jef") return juizado;
  if (rito === "trabalhista") return trabalhista;
  return comum;
}

export function faseDoProcesso(rito: string | null | undefined, codigo: string | null | undefined) {
  return fasesDoRito(rito).find((fase) => fase.codigo === codigo) ?? null;
}

export function faseDoAto(rito: string | null | undefined, tipoAto: string): string | null {
  const fases = fasesDoRito(rito);
  const mapa: Record<string, string> = {
    citacao: "citacao",
    contestacao: fases.some((fase) => fase.codigo === "replica") ? "replica" : "instrucao",
    laudo: "instrucao",
    sentenca: "sentenca",
    recurso: "recurso",
    calculos: "cumprimento",
  };
  return mapa[tipoAto] ?? null;
}

export function etapaDaFase(
  rito: string | null | undefined,
  codigo: string | null | undefined,
): CodigoEtapa {
  return faseDoProcesso(rito, codigo)?.etapa ?? "inicio";
}

export function normalizarNome(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b(s\.?\s?a\.?|ltda\.?|me|epp|eireli)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
