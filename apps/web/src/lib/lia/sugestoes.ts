export const ABERTURA =
  "Oi, eu sou a Lia. Posso explicar o que está na tela e ajudar a usar a Tesia. Por onde quer começar?";

export const SUGESTAO_PADRAO = ["Como uso a Tesia?"];

const DETALHE = [
  "Explique esta intimação",
  "Mostre a conta do prazo",
  "Quais pontos devo conferir na peça?",
];

const POR_ROTA: Record<string, string[]> = {
  "/app": ["O que vence esta semana?", "Resuma minhas intimações novas", "Como uso a Tesia?"],
  "/app/intimacoes": [
    "Como a Tesia lê uma intimação?",
    "O que fazer com uma intimação sem cliente?",
  ],
  "/app/intimacoes/nova": [
    "Como a Tesia lê uma intimação?",
    "O que fazer com uma intimação sem cliente?",
  ],
  "/app/prazos": ["Como o prazo é calculado?", "Como são tratados feriados e suspensões?"],
  "/app/pecas": ["Como edito o rascunho?", "Como baixo com meu timbrado?"],
  "/app/estilo": ["Quantas peças devo enviar?", "Como corrijo o que a Lia aprendeu?"],
  "/app/clientes": ["Como vinculo um processo a um cliente?"],
};

export type ItemDaRota = {
  tipo: "processo" | "intimacao" | "peca";
  id: string;
};

const DETALHES = [
  { tipo: "processo", padrao: /^\/app\/processos\/([^/]+)$/ },
  { tipo: "intimacao", padrao: /^\/app\/intimacoes\/(?!nova$)([^/]+)$/ },
  { tipo: "peca", padrao: /^\/app\/pecas\/([^/]+)$/ },
] as const;

function normalizar(caminho: string) {
  const semConsulta = caminho.split(/[?#]/)[0] ?? caminho;
  return semConsulta.length > 1 ? semConsulta.replace(/\/$/, "") : semConsulta;
}

export function itemDaRota(caminho: string): ItemDaRota | null {
  const alvo = normalizar(caminho);
  for (const { tipo, padrao } of DETALHES) {
    const id = alvo.match(padrao)?.[1];
    if (id) return { tipo, id };
  }
  return null;
}

export function sugestoesDaRota(caminho: string) {
  const alvo = normalizar(caminho);
  if (itemDaRota(alvo)) return DETALHE;
  if (alvo.startsWith("/app/clientes/")) return POR_ROTA["/app/clientes"] ?? SUGESTAO_PADRAO;
  return POR_ROTA[alvo] ?? SUGESTAO_PADRAO;
}
