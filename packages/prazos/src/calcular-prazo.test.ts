import { describe, expect, it } from "vitest";
import { calcularPrazo } from "./calcular-prazo";
import { criarCalendario } from "./calendario";

const civil = criarCalendario();
const penal = criarCalendario({ recessoCivil: false });

describe("calcularPrazo", () => {
  it("reproduz o exemplo do motor de prazos", () => {
    const resultado = calcularPrazo(
      {
        dataDisponibilizacao: "2026-11-03",
        dias: 10,
        contagem: "uteis",
        fundamento: "Lei 9.099/1995, art. 12-A",
      },
      civil,
    );
    expect(resultado).toEqual({
      publicacao: "2026-11-04",
      inicio: "2026-11-05",
      vencimento: "2026-11-18",
      memoria: [
        "Disponibilizado no diário: 03/11/2026 (terça)",
        "Publicação: 04/11/2026 (quarta), primeiro dia útil seguinte",
        "Início da contagem: 05/11/2026 (quinta)",
        "Prazo: 10 dias úteis (Lei 9.099/1995, art. 12-A)",
        "Dias não úteis no período: sábados e domingos",
        "Vencimento: 18/11/2026 (quarta)",
      ],
    });
  });

  it("atravessa a virada de mês", () => {
    const { vencimento } = calcularPrazo(
      { dataDisponibilizacao: "2026-11-24", dias: 5, contagem: "uteis", fundamento: "CPC" },
      civil,
    );
    expect(vencimento).toBe("2026-12-02");
  });

  it("pula o feriado de 20/11 na contagem em dias úteis", () => {
    const resultado = calcularPrazo(
      { dataDisponibilizacao: "2026-11-16", dias: 5, contagem: "uteis", fundamento: "CPC" },
      civil,
    );
    expect(resultado.vencimento).toBe("2026-11-25");
    expect(resultado.memoria).toContain(
      "Dias não úteis no período: sábados e domingos; 20/11/2026 (Dia Nacional de Zumbi e da Consciência Negra)",
    );
  });

  it("suspende no recesso e pula o Carnaval na virada do ano", () => {
    const resultado = calcularPrazo(
      { dataDisponibilizacao: "2026-12-17", dias: 15, contagem: "uteis", fundamento: "CPC" },
      civil,
    );
    expect(resultado.publicacao).toBe("2026-12-18");
    expect(resultado.inicio).toBe("2027-01-21");
    expect(resultado.vencimento).toBe("2027-02-12");
  });

  it("pula a Sexta-feira Santa no início da contagem", () => {
    const { inicio, vencimento } = calcularPrazo(
      { dataDisponibilizacao: "2026-04-01", dias: 5, contagem: "uteis", fundamento: "CPC" },
      civil,
    );
    expect(inicio).toBe("2026-04-06");
    expect(vencimento).toBe("2026-04-10");
  });

  it("prorroga o prazo em dias corridos que termina em feriado na sexta", () => {
    const resultado = calcularPrazo(
      {
        dataDisponibilizacao: "2026-11-12",
        dias: 5,
        contagem: "corridos",
        fundamento: "CPP, art. 798",
      },
      penal,
    );
    expect(resultado.inicio).toBe("2026-11-16");
    expect(resultado.vencimento).toBe("2026-11-23");
    expect(resultado.memoria).toContain(
      "Prazo terminaria em 20/11/2026 (sexta), dia sem expediente",
    );
  });

  it("não aplica o recesso no penal", () => {
    const { vencimento } = calcularPrazo(
      {
        dataDisponibilizacao: "2026-12-17",
        dias: 5,
        contagem: "corridos",
        fundamento: "CPP, art. 798",
      },
      penal,
    );
    expect(vencimento).toBe("2026-12-28");
  });

  it("rejeita entrada inválida", () => {
    expect(() =>
      calcularPrazo(
        { dataDisponibilizacao: "2026-11-03", dias: 0, contagem: "uteis", fundamento: "CPC" },
        civil,
      ),
    ).toThrow();
    expect(() =>
      calcularPrazo(
        { dataDisponibilizacao: "03/11/2026", dias: 5, contagem: "uteis", fundamento: "CPC" },
        civil,
      ),
    ).toThrow();
  });
});
