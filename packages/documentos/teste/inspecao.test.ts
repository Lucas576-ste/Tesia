import PizZip from "pizzip";
import { describe, expect, it } from "vitest";
import { inspecionarModelo, montarPecaTeste } from "../src/inspecao";
import { ModeloInvalido } from "../src/montar";

const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

function desenhoAncorado(relativoH: string, relativoV: string, atras: boolean) {
  return `<w:p><w:r><w:drawing><wp:anchor behindDoc="${atras ? 1 : 0}"><wp:positionH relativeFrom="${relativoH}"><wp:posOffset>0</wp:posOffset></wp:positionH><wp:positionV relativeFrom="${relativoV}"><wp:posOffset>360000</wp:posOffset></wp:positionV><wp:extent cx="7560000" cy="10692000"/><a:blip r:embed="rIdImg"/></wp:anchor></w:drawing></w:r></w:p>`;
}

function modeloComImagem(corpoCabecalho: string) {
  const zip = new PizZip();
  zip.file(
    "word/_rels/document.xml.rels",
    '<Relationships><Relationship Id="rId9" Type="x/header" Target="header1.xml"/></Relationships>',
  );
  zip.file(
    "word/_rels/header1.xml.rels",
    '<Relationships><Relationship Id="rIdImg" Type="x/image" Target="media/fundo.png"/></Relationships>',
  );
  zip.file("word/media/fundo.png", PNG);
  zip.file(
    "word/header1.xml",
    `<w:hdr xmlns:w="${W}">${corpoCabecalho}<w:p><w:r><w:rPr><w:color w:val="FFFFFF"/></w:rPr><w:t>ESCRITÓRIO</w:t></w:r></w:p></w:hdr>`,
  );
  zip.file(
    "word/document.xml",
    `<w:document xmlns:w="${W}" xmlns:r="r"><w:body><w:p/><w:sectPr><w:headerReference w:type="default" r:id="rId9"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="2268" w:right="1134" w:bottom="1134" w:left="2268"/></w:sectPr></w:body></w:document>`,
  );
  return zip.generate({ type: "uint8array" });
}

function modelo({ cabecalho = true }: { cabecalho?: boolean } = {}) {
  const zip = new PizZip();
  zip.file(
    "word/_rels/document.xml.rels",
    '<Relationships><Relationship Id="rId9" Type="x/header" Target="header1.xml"/><Relationship Id="rId8" Type="x/footer" Target="footer1.xml"/></Relationships>',
  );
  zip.file(
    "word/header1.xml",
    `<w:hdr xmlns:w="${W}"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>SOUZA &amp; LIMA ADVOGADOS</w:t></w:r></w:p></w:hdr>`,
  );
  zip.file(
    "word/footer1.xml",
    `<w:ftr xmlns:w="${W}"><w:p><w:r><w:t>Rua A, 10 · Brasília/DF</w:t></w:r></w:p></w:ftr>`,
  );
  zip.file(
    "word/styles.xml",
    `<w:styles xmlns:w="${W}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Garamond"/><w:sz w:val="26"/></w:rPr></w:rPrDefault></w:docDefaults></w:styles>`,
  );
  const referencias = cabecalho
    ? '<w:headerReference w:type="default" r:id="rId9"/><w:footerReference w:type="default" r:id="rId8"/>'
    : "";
  zip.file(
    "word/document.xml",
    `<w:document xmlns:w="${W}" xmlns:r="r"><w:body><w:p><w:r><w:t>x</w:t></w:r></w:p><w:sectPr>${referencias}<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="2268" w:right="1134" w:bottom="1134" w:left="2268"/></w:sectPr></w:body></w:document>`,
  );
  return zip.generate({ type: "uint8array" });
}

describe("inspecionarModelo", () => {
  it("lê cabeçalho, rodapé, margens e fonte", () => {
    const resultado = inspecionarModelo(modelo());
    expect(resultado.cabecalho).toEqual([
      {
        tipo: "texto",
        texto: "SOUZA & LIMA ADVOGADOS",
        alinhamento: "center",
        negrito: true,
        tamanhoPt: 14,
        cor: null,
      },
    ]);
    expect(resultado.rodape[0]).toMatchObject({ texto: "Rua A, 10 · Brasília/DF" });
    expect(resultado.pagina).toMatchObject({ larguraMm: 210, alturaMm: 297, topoMm: 40 });
    expect(resultado.fonte).toEqual({ nome: "Garamond", tamanhoPt: 13 });
  });

  it("lê a posição da imagem ancorada na página e a cor do texto", () => {
    const resultado = inspecionarModelo(modeloComImagem(desenhoAncorado("page", "page", true)));
    expect(resultado.cabecalho[0]).toMatchObject({
      tipo: "imagem",
      larguraMm: 210,
      alturaMm: 297,
      posicao: {
        origemH: "pagina",
        origemV: "pagina",
        xMm: 0,
        yMm: 10,
        alinhamentoH: null,
        atrasDoTexto: true,
      },
    });
    expect(resultado.cabecalho[1]).toMatchObject({ texto: "ESCRITÓRIO", cor: "#FFFFFF" });
  });

  it("lê imagem ancorada na margem e na frente do texto", () => {
    const resultado = inspecionarModelo(
      modeloComImagem(desenhoAncorado("margin", "paragraph", false)),
    );
    expect(resultado.cabecalho[0]).toMatchObject({
      posicao: { origemH: "margem", origemV: "paragrafo", atrasDoTexto: false },
    });
  });

  it("explica quando não há cabeçalho", () => {
    expect(() => inspecionarModelo(modelo({ cabecalho: false }))).toThrow(
      "Não encontramos cabeçalho neste arquivo",
    );
  });

  it("recusa arquivo que não é .docx", () => {
    expect(() => inspecionarModelo(new TextEncoder().encode("%PDF-1.7"))).toThrow(ModeloInvalido);
  });
});

describe("montarPecaTeste", () => {
  it("mantém o cabeçalho do modelo e o texto de exemplo", () => {
    const zip = new PizZip(montarPecaTeste(modelo()));
    expect(zip.file("word/header1.xml")?.asText()).toContain("SOUZA");
    expect(zip.file("word/document.xml")?.asText()).toContain("CONTESTAÇÃO");
  });
});
