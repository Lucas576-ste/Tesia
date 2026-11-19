export type Numero = { valor: string; rotulo: string; isExample: boolean };

export type Depoimento = {
  texto: string;
  nome: string;
  escritorio: string;
  isExample: boolean;
};

export const numeros: Numero[] = [
  { valor: "120+", rotulo: "advogados usando a Tesia", isExample: true },
  { valor: "6 h", rotulo: "economizadas por semana, em média", isExample: true },
  { valor: "3.400", rotulo: "prazos calculados com a conta", isExample: true },
  { valor: "4,8", rotulo: "nota média dos advogados", isExample: true },
];

export const depoimentos: Depoimento[] = [
  {
    texto:
      "Trabalho sozinha e sempre tive medo de perder prazo. Agora vejo a conta inteira antes de confirmar e o rascunho já sai com o meu jeito de escrever.",
    nome: "Camila Ferreira",
    escritorio: "Advogada autônoma, Brasília",
    isExample: true,
  },
  {
    texto:
      "O que mais me surpreendeu foi o estilo. A peça parece minha, com as minhas teses. Eu só reviso os pontos marcados e protocolo.",
    nome: "Rodrigo Menezes",
    escritorio: "Menezes Advocacia Trabalhista",
    isExample: true,
  },
  {
    texto:
      "Somos dois no escritório. A Tesia virou a nossa terceira pessoa: lê as intimações e deixa tudo pronto para a gente decidir.",
    nome: "Patrícia Lopes",
    escritorio: "Lopes & Andrade Advogados",
    isExample: true,
  },
];

export const mostrarExemplos = process.env.NODE_ENV !== "production";

export function visiveis<T extends { isExample: boolean }>(itens: T[]) {
  return itens.filter((item) => !item.isExample || mostrarExemplos);
}
