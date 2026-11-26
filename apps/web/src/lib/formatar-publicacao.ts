export type TrechoDocumento = { id: string; texto: string; titulo: boolean };

const TAMANHO_MAXIMO = 700;
const TAMANHO_DO_GRUPO = 500;

const CABECALHOS =
  "EMENTA|ACÓRDÃO|RELATÓRIO|VOTO|DECISÃO|DESPACHO|SENTENÇA|DISPOSITIVO|CERTIDÃO|ATO ORDINATÓRIO|FUNDAMENTAÇÃO";

const ROTULOS = [
  "Número do [Pp]rocesso",
  "Processo",
  "PROCESSO",
  "Classe(?: [Jj]udicial)?",
  "CLASSE",
  "Relator(?:a|\\(a\\))?",
  "RELATOR(?:A|\\(A\\))?",
  "AGRAVANTE",
  "AGRAVAD[OA]",
  "APELANTE",
  "APELAD[OA]",
  "REQUERENTE",
  "REQUERID[OA]",
  "AUTORA?",
  "RÉU",
  "RECORRENTE",
  "RECORRID[OA]",
  "EXEQUENTE",
  "EXECUTAD[OA]",
  "RECLAMANTE",
  "RECLAMAD[OA]",
  "ADV",
  "ADVOGAD[OA][^:.]{0,30}",
  "Advogad[oa](?:\\(s\\)|s)?[^:.]{0,40}",
].join("|");

const SEM_ABREVIACAO =
  "(?<!\\b(?:art|arts|fl|fls|n|nº|inc|p|Min|Des|Dr|Dra|Rel|Exmo|Sr|Sra)\\.)(?<!(?<![\\wÀ-ú])[A-ZÀ-Ú]\\.(?<!\\b[IVX]\\.))";

const CORPO = "(?=[A-ZÀ-Ú](?:[a-zà-ú]|\\s[a-zà-ú])|\\d|[IVX]+\\s?[.\\-–])";

const ABERTURA = "(?=(?:Vistos|Trata-se|Cuida-se)(?![\\wÀ-ú]))";

const CORTES = [
  `\\s+(?=(?:${CABECALHOS}):?\\s+${ABERTURA})`,
  `(?<=(?<![\\wÀ-ú])(?:${CABECALHOS}):?)\\s+${ABERTURA}`,
  `(?<=[.:;!?\\d])\\s+(?=(?:${CABECALHOS})(?::|$|\\s+${CORPO}))`,
  `(?<=^(?:${CABECALHOS}):?)\\s+${CORPO}`,
  `(?<=[.:;!?\\d]\\s+(?:${CABECALHOS}):?)\\s+${CORPO}`,
  "\\s+(?=(?:PODER JUDICIÁRIO|Poder Judiciário)(?![\\wÀ-ú]))",
  `(?<!(?<![\\wÀ-ú])(?:do|da|DO|DA))\\s+(?=(?:${ROTULOS})\\s?:)`,
  `(?<=[.:;])${SEM_ABREVIACAO}\\s+(?=\\d{1,2}\\.\\s+[A-ZÀ-Ú])`,
  "(?<=[.:;])\\s+(?=(?:I|II|III|IV|V|VI|VII|VIII|IX|X)\\s?[.\\-–]\\s+[A-ZÀ-Ú])",
  "(?<=[.:;])(?<!-se\\.)\\s+(?=(?:Publique-se|Intimem-se|Intime-se|Cumpra-se)(?![\\wÀ-ú]))",
  "\\s+(?=Brasília(?:\\s?[/\\-–]\\s?DF|,\\s?DF)?\\s?,\\s*(?:\\d|data))",
].map((padrao) => new RegExp(padrao, "g"));

const FIM_DE_FRASE = new RegExp(`(?<=[.!?])${SEM_ABREVIACAO}\\s+(?=[A-ZÀ-Ú"“(])`, "g");

const TITULO = new RegExp(`^(?:${CABECALHOS}|PODER JUDICIÁRIO):?$`);

const FIM_DE_LINHA = /[.:;!?]$/;
const PEDE_CONTINUACAO = /(?:,|(?<![\wÀ-ú])(?:de|da|do|e|o|a|em|que|para|com|no|na|ao|por))$/;
const COMECA_MINUSCULA = /^(?![a-z]\))[a-zà-ú]/;

function emendar(anterior: string, seguinte: string) {
  if (FIM_DE_LINHA.test(anterior) || TITULO.test(anterior)) return null;
  const minuscula = COMECA_MINUSCULA.test(seguinte);
  if (anterior.endsWith("-") && minuscula) return `${anterior}${seguinte}`;
  return minuscula || PEDE_CONTINUACAO.test(anterior) ? `${anterior} ${seguinte}` : null;
}

function emendarLinhas(texto: string) {
  return texto
    .split(/\n+/)
    .map((linha) => linha.trim())
    .filter(Boolean)
    .reduce<string[]>((linhas, linha) => {
      const anterior = linhas.at(-1);
      const junta = anterior === undefined ? null : emendar(anterior, linha);
      if (junta === null) linhas.push(linha);
      else linhas[linhas.length - 1] = junta;
      return linhas;
    }, []);
}

function agruparFrases(bloco: string) {
  if (bloco.length <= TAMANHO_MAXIMO) return [bloco];
  return bloco.split(FIM_DE_FRASE).reduce<string[]>((grupos, frase) => {
    const atual = grupos.at(-1);
    if (atual === undefined || atual.length >= TAMANHO_DO_GRUPO) return [...grupos, frase];
    return [...grupos.slice(0, -1), `${atual} ${frase}`];
  }, []);
}

function cortarLinha(linha: string) {
  return CORTES.reduce((texto, corte) => texto.replace(corte, "\n"), linha).split("\n");
}

export function dividirDocumento(texto: string): TrechoDocumento[] {
  return emendarLinhas(texto)
    .flatMap(cortarLinha)
    .map((bloco) => bloco.trim())
    .filter(Boolean)
    .flatMap(agruparFrases)
    .map((bloco, indice) => ({ id: `p${indice}`, texto: bloco, titulo: TITULO.test(bloco) }));
}

export function dividirFrases(texto: string) {
  return texto.trim().split(FIM_DE_FRASE).filter(Boolean);
}

export type Grifo = { id: string; de: number; ate: number };

export function chaveDoGrifo(grifos: Grifo[]) {
  return grifos.map(({ id, de, ate }) => `${id}:${de}:${ate}`).join();
}

function padronizar(caractere: string) {
  if (/[“”"«»]/.test(caractere)) return '"';
  if (/[‘’']/.test(caractere)) return "'";
  return caractere.toLocaleLowerCase("pt-BR").charAt(0);
}

function normalizar(texto: string) {
  let limpo = "";
  const posicoes: number[] = [];
  for (let indice = 0; indice < texto.length; indice += 1) {
    const caractere = texto[indice]!;
    const espaco = /\s/.test(caractere);
    if (espaco && (limpo === "" || limpo.endsWith(" "))) continue;
    limpo += espaco ? " " : padronizar(caractere);
    posicoes.push(indice);
  }
  return { limpo: limpo.trimEnd(), posicoes };
}

export function acharTrecho(documento: TrechoDocumento[], trecho: string): Grifo[] {
  const alvo = normalizar(trecho).limpo;
  if (!alvo) return [];
  const blocos = documento.map(({ id, texto }) => ({ id, ...normalizar(texto) }));
  const junto = blocos.map(({ limpo }) => limpo).join(" ");
  const procurado = junto.includes(alvo) ? alvo : alvo.slice(0, 40).trimEnd();
  const inicio = junto.indexOf(procurado);
  if (inicio < 0) return [];
  const fim = inicio + procurado.length;
  let comeco = 0;
  return blocos.flatMap(({ id, limpo, posicoes }) => {
    const de = Math.max(inicio - comeco, 0);
    const ate = Math.min(fim - comeco, limpo.length);
    comeco += limpo.length + 1;
    return ate > de ? [{ id, de: posicoes[de]!, ate: posicoes[ate - 1]! + 1 }] : [];
  });
}
