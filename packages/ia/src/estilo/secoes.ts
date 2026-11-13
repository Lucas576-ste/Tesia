export const SECOES_ESTILO = [
  "enderecamento",
  "qualificacao",
  "fatos",
  "preliminares",
  "fundamentos",
  "pedidos",
  "fechamento",
  "outra",
] as const;

export type SecaoEstilo = (typeof SECOES_ESTILO)[number];

export type TrechoEstilo = {
  secao: SecaoEstilo;
  titulo: string | null;
  texto: string;
};

const ENDERECAMENTO =
  /^(excelent|exm|ao (juizo|meritissimo|excelent)|ilustr|egregi|colend|mm\.?\s)/;

export const MAXIMO_CARACTERES_TRECHO = 1500;
const MINIMO_CARACTERES_TRECHO = 40;
const MAXIMO_CARACTERES_TITULO = 90;

function semAcento(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function ehTitulo(linha: string) {
  const texto = linha.trim();
  if (!texto || texto.length > MAXIMO_CARACTERES_TITULO) return false;
  if (ENDERECAMENTO.test(semAcento(texto))) return false;
  if (/^([IVXLC]+|\d+(\.\d+)*)\s*[-–—.)]\s*\S/.test(texto) && !/[.;:]$/.test(texto)) return true;
  const letras = texto.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (letras.length < 4) return false;
  const maiusculas = letras.replace(/[^A-ZÀ-Þ]/g, "").length;
  return maiusculas / letras.length > 0.8;
}

export function classificarTitulo(titulo: string): SecaoEstilo {
  const texto = semAcento(titulo);
  if (
    /preliminar|prescri|decadencia|ilegitimidade|inepcia|incompetencia|litispendencia|coisa julgada|falta de interesse/.test(
      texto,
    )
  )
    return "preliminares";
  if (/pedido|requerimento/.test(texto)) return "pedidos";
  if (/fato|sintese|resumo|relato|historico/.test(texto)) return "fatos";
  if (/direito|fundament|merito|razo|juridic|jurisprud|cabimento|tempestividade/.test(texto))
    return "fundamentos";
  return "outra";
}

const FECHAMENTO =
  /(nestes termos|termos em que|pede deferimento|e(spera)? deferimento|^\s*\w[\w\s]*,\s*\d{1,2}\s+de\s+\w+\s+de\s+\d{4}|oab\s*\/?\s*[a-z]{2})/;

function quebrar(texto: string): string[] {
  const paragrafos = texto
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const partes: string[] = [];
  let atual = "";
  for (const paragrafo of paragrafos) {
    if (atual && atual.length + paragrafo.length + 1 > MAXIMO_CARACTERES_TRECHO) {
      partes.push(atual);
      atual = "";
    }
    if (paragrafo.length > MAXIMO_CARACTERES_TRECHO) {
      for (let inicio = 0; inicio < paragrafo.length; inicio += MAXIMO_CARACTERES_TRECHO) {
        partes.push(paragrafo.slice(inicio, inicio + MAXIMO_CARACTERES_TRECHO));
      }
      continue;
    }
    atual = atual ? `${atual}\n${paragrafo}` : paragrafo;
  }
  if (atual) partes.push(atual);
  return partes;
}

type Bloco = { secao: SecaoEstilo; titulo: string | null; linhas: string[] };

function separarPreambulo(linhas: string[]): Bloco[] {
  const enderecamento: string[] = [];
  let indice = 0;
  while (indice < linhas.length && ENDERECAMENTO.test(semAcento(linhas[indice] ?? ""))) {
    enderecamento.push(linhas[indice] ?? "");
    indice += 1;
  }
  const blocos: Bloco[] = [];
  if (enderecamento.length)
    blocos.push({ secao: "enderecamento", titulo: null, linhas: enderecamento });
  const resto = linhas.slice(indice);
  if (resto.length) blocos.push({ secao: "qualificacao", titulo: null, linhas: resto });
  return blocos;
}

function separarFechamento(blocos: Bloco[]): Bloco[] {
  const ultimo = blocos.at(-1);
  if (!ultimo) return blocos;
  const inicio = ultimo.linhas.findIndex((linha) => FECHAMENTO.test(semAcento(linha)));
  if (inicio < 0) return blocos;
  const fechamento: Bloco = {
    secao: "fechamento",
    titulo: null,
    linhas: ultimo.linhas.slice(inicio),
  };
  const corpo = { ...ultimo, linhas: ultimo.linhas.slice(0, inicio) };
  return [...blocos.slice(0, -1), ...(corpo.linhas.length ? [corpo] : []), fechamento];
}

export function dividirEmSecoes(texto: string): TrechoEstilo[] {
  const linhas = texto
    .split(/\n/)
    .map((linha) => linha.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const primeiroTitulo = linhas.findIndex(ehTitulo);
  const preambulo = primeiroTitulo < 0 ? [] : linhas.slice(0, primeiroTitulo);
  const blocos: Bloco[] = separarPreambulo(preambulo);
  let atual: Bloco | null =
    primeiroTitulo < 0 ? { secao: "outra", titulo: null, linhas: [...linhas] } : null;

  for (const linha of primeiroTitulo < 0 ? [] : linhas.slice(primeiroTitulo)) {
    if (ehTitulo(linha)) {
      if (atual) blocos.push(atual);
      atual = { secao: classificarTitulo(linha), titulo: linha, linhas: [] };
    } else {
      atual?.linhas.push(linha);
    }
  }
  if (atual) blocos.push(atual);

  return separarFechamento(blocos).flatMap(({ secao, titulo, linhas: conteudo }) =>
    quebrar(conteudo.join("\n"))
      .filter((parte) => parte.length >= MINIMO_CARACTERES_TRECHO || secao === "fechamento")
      .map((parte) => ({ secao, titulo, texto: parte })),
  );
}
