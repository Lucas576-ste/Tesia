import { describe, expect, it } from "vitest";
import { perfilGravadoSchema } from "@tesia/shared";
import { classificarTipoPeca } from "../src/estilo/classificar.js";
import { gerarExemploEstilo } from "../src/estilo/exemplo.js";
import { clienteFalso } from "./cliente-falso.js";

const perfil = perfilGravadoSchema.parse({
  estrutura_por_tipo: [],
  tom: "Direto",
  tamanho_frases: "curtas",
  citacao_lei: "",
  citacao_jurisprudencia: "",
  referencias_frequentes: [],
  abertura: "vem, respeitosamente",
  fechamento: "Nestes termos, pede deferimento.",
  expressoes_tipicas: ["Em síntese"],
  frases_exibicao: [],
});

describe("gerarExemploEstilo", () => {
  it("devolve o parágrafo e manda o anterior para variar", async () => {
    const texto = "A parte autora ajuizou ação. Em síntese, não comprovou o alegado na inicial.";
    const { cliente, parse } = clienteFalso({ paragrafo: ` ${texto} ` });
    const etapa = await gerarExemploEstilo(cliente, perfil, {
      tipo: "Contestação",
      anterior: "Texto antigo",
    });
    expect(etapa.resultado).toBe(texto);
    expect(etapa.versaoPrompt).toBe("exemplo@1");
    expect(JSON.stringify(parse.mock.calls)).toContain("<anterior>");
  });
});

describe("classificarTipoPeca", () => {
  const opcoes = [{ id: "a1", nome: "Contestação", area: "civel" }];

  it("devolve o id escolhido", async () => {
    const { cliente } = clienteFalso({ id: "a1" });
    expect((await classificarTipoPeca(cliente, "CONTESTAÇÃO", opcoes)).resultado).toBe("a1");
  });

  it("devolve null quando é outro", async () => {
    const { cliente } = clienteFalso({ id: "outro" });
    expect((await classificarTipoPeca(cliente, "texto", opcoes)).resultado).toBeNull();
  });
});
