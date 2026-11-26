import PizZip from "pizzip";
import { describe, expect, it } from "vitest";
import { montarPlanilha } from "../src/planilha";

const colunas = [
  { titulo: "Processo", largura: 28 },
  { titulo: "Conteúdo", largura: 60 },
];

describe("montarPlanilha", () => {
  it("monta um .xlsx com as partes obrigatórias", () => {
    const zip = new PizZip(montarPlanilha(colunas, [["0000001-11.2026.8.07.0001", "Intimado."]]));
    for (const parte of [
      "[Content_Types].xml",
      "_rels/.rels",
      "xl/workbook.xml",
      "xl/_rels/workbook.xml.rels",
      "xl/styles.xml",
      "xl/worksheets/sheet1.xml",
    ])
      expect(zip.file(parte), parte).not.toBeNull();
  });

  it("grava cabeçalho e linhas com acentos e caracteres especiais escapados", () => {
    const zip = new PizZip(
      montarPlanilha(colunas, [
        ["0000001-11.2026.8.07.0001", 'Fica "intimado" & notificado <hoje> — João'],
        ["0000002-22.2026.8.07.0001", "Segunda linha"],
      ]),
    );
    const aba = zip.file("xl/worksheets/sheet1.xml")?.asText() ?? "";
    expect(aba).toContain("Conteúdo");
    expect(aba).toContain("Fica &quot;intimado&quot; &amp; notificado &lt;hoje&gt; — João");
    expect(aba).toContain('r="A3"');
    expect(aba).toContain('r="B3"');
  });

  it("remove caracteres de controle e limita o tamanho da célula", () => {
    const zip = new PizZip(montarPlanilha(colunas, [["x", `a\u0000b${"z".repeat(40000)}`]]));
    const aba = zip.file("xl/worksheets/sheet1.xml")?.asText() ?? "";
    expect(aba).not.toContain("\u0000");
    expect(aba.length).toBeLessThan(34000 + 3000);
  });

  it("aceita planilha só com o cabeçalho e nome de aba com símbolos proibidos", () => {
    const zip = new PizZip(montarPlanilha(colunas, [], "Intimações: 11/2026?"));
    expect(zip.file("xl/workbook.xml")?.asText()).toContain('name="Intimações  11 2026 "');
  });
});
