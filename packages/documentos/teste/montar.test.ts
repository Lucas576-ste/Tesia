import PizZip from "pizzip";
import { describe, expect, it } from "vitest";
import { ModeloInvalido, montarDocx, nomeArquivoDocx, validarModelo } from "../src/montar";

const documento = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "EXCELENTÍSSIMO SENHOR DOUTOR JUIZ" }] },
    { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "I – DOS FATOS" }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "O autor & a ré < acordo. Perícia em " },
        { type: "text", text: "[CONFIRMAR: data da perícia]" },
        { type: "text", text: " e argumento ", marks: [] },
        { type: "text", text: "em negrito", marks: [{ type: "bold" }] },
        { type: "text", text: "." },
      ],
    },
    {
      type: "orderedList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "primeiro pedido" }] }],
        },
        {
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: "segundo pedido" }] }],
        },
      ],
    },
  ],
};

function ler(bytes: Uint8Array, caminho = "word/document.xml") {
  return new PizZip(bytes).file(caminho)?.asText() ?? "";
}

function modeloDoAdvogado() {
  const zip = new PizZip();
  zip.file(
    "[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/></Types>',
  );
  zip.file(
    "_rels/.rels",
    '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  );
  zip.file(
    "word/_rels/document.xml.rels",
    '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/></Relationships>',
  );
  zip.file(
    "word/header1.xml",
    '<?xml version="1.0" encoding="UTF-8"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>ESCRITÓRIO TESTE</w:t></w:r></w:p></w:hdr>',
  );
  zip.file(
    "word/document.xml",
    '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body><w:p><w:r><w:t>Texto de exemplo do modelo</w:t></w:r></w:p><w:sectPr><w:headerReference w:type="default" r:id="rId9"/><w:pgMar w:top="2268" w:right="1134" w:bottom="1134" w:left="2268"/></w:sectPr></w:body></w:document>',
  );
  return zip.generate({ type: "uint8array" });
}

describe("montarDocx", () => {
  it("monta um .docx válido com o modelo padrão", () => {
    const bytes = montarDocx(null, documento);
    expect(validarModelo(bytes)).toBe(true);
    const xml = ler(bytes);
    expect(xml).toContain("EXCELENTÍSSIMO SENHOR DOUTOR JUIZ");
    expect(xml).toContain('<w:pgMar w:top="1701"');
    expect(ler(bytes, "word/styles.xml")).toContain("Times New Roman");
  });

  it("escapa caracteres especiais e destaca pendências em amarelo", () => {
    const xml = ler(montarDocx(null, documento));
    expect(xml).toContain("O autor &amp; a ré &lt; acordo.");
    expect(xml).toMatch(
      /<w:highlight w:val="yellow"\/><\/w:rPr><w:t xml:space="preserve">\[CONFIRMAR: data da perícia\]/,
    );
    expect(xml).toMatch(/<w:b\/><\/w:rPr><w:t xml:space="preserve">em negrito/);
    expect(xml).toMatch(/<w:b\/><\/w:rPr><w:t xml:space="preserve">I – DOS FATOS/);
    expect(xml).toContain("1. ");
    expect(xml).toMatch(
      /<w:jc w:val="left"\/><\/w:pPr><w:r><w:rPr><w:b\/><\/w:rPr><w:t xml:space="preserve">EXCELENTÍSSIMO/,
    );
    expect(xml).toContain("segundo pedido");
  });

  it("no modelo do advogado, troca só o corpo e mantém cabeçalho e margens", () => {
    const modelo = modeloDoAdvogado();
    const bytes = montarDocx(modelo, documento);
    const xml = ler(bytes);
    expect(xml).not.toContain("Texto de exemplo do modelo");
    expect(xml).toContain("I – DOS FATOS");
    expect(xml).toContain('<w:pgMar w:top="2268" w:right="1134" w:bottom="1134" w:left="2268"/>');
    expect(xml).toContain('<w:headerReference w:type="default" r:id="rId9"/>');
    expect(ler(bytes, "word/header1.xml")).toContain("ESCRITÓRIO TESTE");
  });

  it("recusa arquivo que não é .docx", () => {
    expect(() => validarModelo(new TextEncoder().encode("não sou um docx"))).toThrow(
      ModeloInvalido,
    );
    const zip = new PizZip();
    zip.file("qualquer.txt", "x");
    expect(() => montarDocx(zip.generate({ type: "uint8array" }), documento)).toThrow(
      ModeloInvalido,
    );
  });
});

describe("nomeArquivoDocx", () => {
  it("monta um nome limpo", () => {
    expect(nomeArquivoDocx(["Recurso inominado", "José x INSS/DF"])).toBe(
      "Recurso inominado - José x INSSDF.docx",
    );
    expect(nomeArquivoDocx([])).toBe("peca.docx");
  });
});
