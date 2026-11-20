import { describe, expect, it } from "vitest";
import { ABERTURA, itemDaRota, sugestoesDaRota } from "@/lib/lia/sugestoes";

const ID = "7b2f4c1e-3a5d-4e8f-9b1a-0c2d3e4f5a6b";

const CASOS: [string, string, string[]][] = [
  [
    "Painel",
    "/app",
    ["O que vence esta semana?", "Resuma minhas intimações novas", "Como uso a Tesia?"],
  ],
  [
    "Intimações",
    "/app/intimacoes",
    ["Como a Tesia lê uma intimação?", "O que fazer com uma intimação sem cliente?"],
  ],
  [
    "Detalhe de intimação",
    `/app/intimacoes/${ID}`,
    ["Explique esta intimação", "Mostre a conta do prazo", "Quais pontos devo conferir na peça?"],
  ],
  [
    "Detalhe de processo",
    `/app/processos/${ID}`,
    ["Explique esta intimação", "Mostre a conta do prazo", "Quais pontos devo conferir na peça?"],
  ],
  [
    "Detalhe de peça",
    `/app/pecas/${ID}`,
    ["Explique esta intimação", "Mostre a conta do prazo", "Quais pontos devo conferir na peça?"],
  ],
  [
    "Prazos",
    "/app/prazos",
    ["Como o prazo é calculado?", "Como são tratados feriados e suspensões?"],
  ],
  ["Peças", "/app/pecas", ["Como edito o rascunho?", "Como baixo com meu timbrado?"]],
  [
    "Meu estilo",
    "/app/estilo",
    ["Quantas peças devo enviar?", "Como corrijo o que a Lia aprendeu?"],
  ],
  ["Clientes", "/app/clientes", ["Como vinculo um processo a um cliente?"]],
  ["Detalhe de cliente", `/app/clientes/${ID}`, ["Como vinculo um processo a um cliente?"]],
  ["Qualquer outra tela", "/app/configuracoes", ["Como uso a Tesia?"]],
];

describe("sugestões iniciais por tela", () => {
  it.each(CASOS)("%s", (_nome, rota, esperado) => {
    expect(sugestoesDaRota(rota)).toEqual(esperado);
  });

  it("ignora barra final e parâmetros", () => {
    expect(sugestoesDaRota("/app/prazos/?filtro=hoje")).toEqual(sugestoesDaRota("/app/prazos"));
  });

  it("nova intimação usa as sugestões de Intimações", () => {
    expect(sugestoesDaRota("/app/intimacoes/nova")).toEqual(sugestoesDaRota("/app/intimacoes"));
  });

  it("identifica o item aberto", () => {
    expect(itemDaRota(`/app/pecas/${ID}`)).toEqual({ tipo: "peca", id: ID });
    expect(itemDaRota("/app/intimacoes/nova")).toBeNull();
  });

  it("tem a mensagem de abertura pedida", () => {
    expect(ABERTURA).toBe(
      "Oi, eu sou a Lia. Posso explicar o que está na tela e ajudar a usar a Tesia. Por onde quer começar?",
    );
  });
});
