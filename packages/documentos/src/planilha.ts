import PizZip from "pizzip";
import { escaparXml, semControle } from "./xml";

export type ColunaPlanilha = { titulo: string; largura: number };

const LIMITE_CELULA = 32000;

function nomeDaColuna(indice: number) {
  let numero = indice + 1;
  let nome = "";
  while (numero > 0) {
    const resto = (numero - 1) % 26;
    nome = String.fromCharCode(65 + resto) + nome;
    numero = Math.floor((numero - 1) / 26);
  }
  return nome;
}

function celula(coluna: number, linha: number, texto: string, estilo: number) {
  const limpo = escaparXml(semControle(texto).slice(0, LIMITE_CELULA));
  return `<c r="${nomeDaColuna(coluna)}${linha}" s="${estilo}" t="inlineStr"><is><t xml:space="preserve">${limpo}</t></is></c>`;
}

function linhaXml(valores: string[], numero: number, estilo: number) {
  return `<row r="${numero}">${valores.map((valor, coluna) => celula(coluna, numero, valor, estilo)).join("")}</row>`;
}

export function montarPlanilha(
  colunas: ColunaPlanilha[],
  linhas: string[][],
  nomeAba = "Planilha",
) {
  const cabecalho = linhaXml(
    colunas.map(({ titulo }) => titulo),
    1,
    1,
  );
  const corpo = linhas.map((valores, indice) => linhaXml(valores, indice + 2, 0)).join("");
  const larguras = colunas
    .map(
      ({ largura }, indice) =>
        `<col min="${indice + 1}" max="${indice + 1}" width="${largura}" customWidth="1"/>`,
    )
    .join("");
  const aba = escaparXml(
    semControle(nomeAba)
      .replace(/[\\/?*[\]:]/g, " ")
      .slice(0, 31) || "Planilha",
  );

  const zip = new PizZip();
  zip.file(
    "[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
  );
  zip.file(
    "_rels/.rels",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
  );
  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${aba}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  );
  zip.file(
    "xl/_rels/workbook.xml.rels",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
  );
  zip.file(
    "xl/styles.xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>',
  );
  zip.file(
    "xl/worksheets/sheet1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${larguras}</cols><sheetData>${cabecalho}${corpo}</sheetData></worksheet>`,
  );
  return zip.generate({ type: "uint8array", compression: "DEFLATE" });
}
