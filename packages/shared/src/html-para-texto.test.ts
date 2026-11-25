import { describe, expect, it } from "vitest";
import { htmlParaTexto } from "./html-para-texto";

describe("htmlParaTexto", () => {
  it("mantém texto puro como está", () => {
    expect(htmlParaTexto("Fica intimado.\nPrazo de 15 dias.")).toBe(
      "Fica intimado.\nPrazo de 15 dias.",
    );
    expect(htmlParaTexto("valor < 10 e > 5")).toBe("valor < 10 e > 5");
  });

  it("tira as marcas e junta as células da tabela", () => {
    const html =
      '<table><tr><td style="width: 20%">RECORRENTE</td><td style="width: 1%">:</td><td style="width: 79%">EMPRESA S/A</td></tr><tr><td>ADVOGADOS</td><td>:</td><td>GABRIEL - DF036120</td></tr></table><p>Processo distribuído em 13/11/2026.</p>';
    expect(htmlParaTexto(html)).toBe(
      "RECORRENTE : EMPRESA S/A\nADVOGADOS : GABRIEL - DF036120\nProcesso distribuído em 13/11/2026.",
    );
  });

  it("quebra linha em br e remove estilo e script", () => {
    expect(
      htmlParaTexto("<style>p{color:red}</style>Linha 1<br/>Linha 2<script>x()</script>"),
    ).toBe("Linha 1\nLinha 2");
  });

  it("decodifica entidades", () => {
    expect(
      htmlParaTexto("<p>Jo&atilde;o &amp; Maria &#8211; R&#x24; 10&nbsp;mil &quot;ok&quot;</p>"),
    ).toBe('João & Maria – R$ 10 mil "ok"');
  });
});
