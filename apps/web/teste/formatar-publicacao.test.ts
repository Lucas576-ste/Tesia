import { describe, expect, it } from "vitest";
import { acharTrecho, dividirDocumento } from "@/lib/formatar-publicacao";

const textos = (texto: string) => dividirDocumento(texto).map((bloco) => bloco.texto);
const semEspacos = (texto: string) => texto.replace(/\s+/g, "");

const publicacao =
  "PODER JUDICIÁRIO TRIBUNAL DE EXEMPLO Número do processo: 0000001-00.2026.8.07.0001 Classe judicial: APELAÇÃO CÍVEL APELANTE: PESSOA FICTÍCIA ADVOGADO DO AUTOR: NOME INVENTADO SENTENÇA Vistos etc. Trata-se de ação fictícia. I. Relatório do caso. II. Fundamentos. DISPOSITIVO Ante o exposto, julgo improcedente. Publique-se. Intimem-se. Brasília, 10 de novembro de 2026.";

describe("dividirDocumento", () => {
  it("separa cabeçalhos, rótulos, itens e fechos", () => {
    expect(textos(publicacao)).toEqual([
      "PODER JUDICIÁRIO TRIBUNAL DE EXEMPLO",
      "Número do processo: 0000001-00.2026.8.07.0001",
      "Classe judicial: APELAÇÃO CÍVEL",
      "APELANTE: PESSOA FICTÍCIA",
      "ADVOGADO DO AUTOR: NOME INVENTADO",
      "SENTENÇA",
      "Vistos etc. Trata-se de ação fictícia.",
      "I. Relatório do caso.",
      "II. Fundamentos.",
      "DISPOSITIVO",
      "Ante o exposto, julgo improcedente.",
      "Publique-se. Intimem-se.",
      "Brasília, 10 de novembro de 2026.",
    ]);
    expect(dividirDocumento(publicacao).filter((bloco) => bloco.titulo)).toHaveLength(2);
  });

  it("numera itens sem cortar abreviações", () => {
    expect(
      textos("Decido. 1. Defiro o pedido, nos termos do art. 5. O prazo corre. 2. Cite-se."),
    ).toEqual([
      "Decido.",
      "1. Defiro o pedido, nos termos do art. 5. O prazo corre.",
      "2. Cite-se.",
    ]);
  });

  it("não corta a palavra do cabeçalho no meio de uma frase", () => {
    const ementa = "EMENTA CONTRA A SENTENÇA QUE JULGOU O PEDIDO.";
    expect(textos(ementa)).toEqual([ementa]);
  });

  it("divide o texto longo por frases, sem separar o nome abreviado", () => {
    const frase = "O Min. J. Fictício analisou o art. 10 da lei de exemplo com atenção. ";
    const blocos = textos(frase.repeat(30));
    expect(blocos.length).toBeGreaterThan(2);
    for (const bloco of blocos) {
      expect(bloco.startsWith("O Min. J. Fictício")).toBe(true);
      expect(bloco.endsWith("atenção.")).toBe(true);
    }
  });

  it("nunca muda o texto, só os espaços", () => {
    const pecas = [
      "SENTENÇA",
      "DECISÃO",
      "Processo:",
      "ADV:",
      "art.",
      "fl.",
      "1.",
      "II.",
      "Publique-se.",
      "Brasília,",
      "12",
      "O",
      "recurso",
      "foi",
      "negado.",
      "(Rel.",
      "Des.",
      "A.",
      ";",
      ":",
      "\n",
    ];
    let semente = 7;
    const sorteio = () => (semente = (semente * 48271) % 2147483647);
    for (let rodada = 0; rodada < 300; rodada += 1) {
      const texto = Array.from(
        { length: 5 + (sorteio() % 250) },
        () => pecas[sorteio() % pecas.length],
      ).join(" ");
      expect(semEspacos(textos(texto).join(""))).toBe(semEspacos(texto));
    }
  });

  it("devolve vazio para texto vazio", () => {
    expect(dividirDocumento("  ")).toEqual([]);
  });
});

describe("linhas quebradas de PDF", () => {
  it("emenda a frase que continua na linha seguinte", () => {
    const pdf =
      "Consta dos autos que o réu não foi\nintimado pessoalmente da\nDecisão proferida,\nBrasília não consta.";
    expect(textos(pdf)).toEqual([
      "Consta dos autos que o réu não foi intimado pessoalmente da Decisão proferida, Brasília não consta.",
    ]);
  });

  it("emenda palavra partida pelo hífen sem tirar o hífen", () => {
    expect(textos("O prazo da inti-\nmação correu.")).toEqual(["O prazo da inti-mação correu."]);
  });

  it("mantém separados títulos, rótulos, alíneas e frases terminadas", () => {
    const linhas = [
      "SENTENÇA",
      "vistos os autos.",
      "Juiz: Nome Inventado",
      "OUTRA LINHA",
      "Os pedidos são",
      "a) o primeiro;",
    ];
    expect(textos(linhas.join("\n"))).toEqual([
      "SENTENÇA",
      "vistos os autos.",
      "Juiz: Nome Inventado",
      "OUTRA LINHA",
      "Os pedidos são",
      "a) o primeiro;",
    ]);
  });
});

describe("acharTrecho", () => {
  const documento = dividirDocumento(publicacao);
  const marcados = (trecho: string, blocos = documento) =>
    acharTrecho(blocos, trecho).map(({ id, de, ate }) =>
      blocos.find((bloco) => bloco.id === id)?.texto.slice(de, ate),
    );

  it("grifa só o trecho citado dentro do parágrafo", () => {
    expect(marcados("julgo improcedente")).toEqual(["julgo improcedente"]);
  });

  it("grifa o pedaço de cada bloco que o trecho cobre", () => {
    expect(marcados("julgo improcedente. Publique-se.")).toEqual([
      "julgo improcedente.",
      "Publique-se.",
    ]);
  });

  it("ignora diferença de maiúsculas, espaços e aspas", () => {
    const blocos = dividirDocumento("Consta  o termo “Fictício” nos autos.");
    expect(marcados('o termo "fictício"', blocos)).toEqual(["o termo “Fictício”"]);
  });

  it("quando só o começo confere, grifa só esse começo", () => {
    expect(marcados("Ante o exposto, julgo improcedente. Publicação que a IA mudou")).toEqual([
      "Ante o exposto, julgo improcedente.",
      "Publ",
    ]);
  });

  it("não grifa nada quando o trecho não existe", () => {
    expect(acharTrecho(documento, "isto não está no texto")).toEqual([]);
    expect(acharTrecho(documento, "")).toEqual([]);
  });
});
