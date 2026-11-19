import { describe, expect, it } from "vitest";
import { escolherAvisos, momentoDoPrazo, montarEmail, type PrazoAlerta } from "./escolher";

const base: PrazoAlerta = {
  id: "p1",
  usuarioId: "u1",
  tipo: "prazo",
  descricao: "Réplica",
  partes: "Ana x Banco",
  vencimento: "2026-12-10",
  interno: "2026-12-08",
  hora: null,
  link: "https://tesia.app/app",
};
const todos = ["5_uteis", "2_uteis", "fatal", "interno"];

describe("momentoDoPrazo", () => {
  it("avisa no dia do fatal", () => {
    expect(momentoDoPrazo(base, "2026-12-10", todos)).toBe("fatal");
  });
  it("avisa no dia do interno", () => {
    expect(momentoDoPrazo(base, "2026-12-08", todos)).toBe("interno");
  });
  it("conta 2 e 5 dias úteis pulando o fim de semana", () => {
    expect(momentoDoPrazo({ ...base, interno: null }, "2026-12-08", todos)).toBe("2_uteis");
    expect(momentoDoPrazo(base, "2026-12-03", todos)).toBe("5_uteis");
    expect(momentoDoPrazo(base, "2026-12-04", todos)).toBeNull();
  });
  it("respeita os momentos escolhidos", () => {
    expect(momentoDoPrazo(base, "2026-12-10", ["interno"])).toBeNull();
  });
  it("audiência só avisa no dia", () => {
    const audiencia = { ...base, tipo: "audiencia", interno: null };
    expect(momentoDoPrazo(audiencia, "2026-12-03", todos)).toBeNull();
    expect(momentoDoPrazo(audiencia, "2026-12-10", todos)).toBe("fatal");
  });
  it("ignora prazo vencido", () => {
    expect(momentoDoPrazo(base, "2026-12-11", todos)).toBeNull();
  });
});

describe("escolherAvisos", () => {
  it("agrupa por usuário e não repete o que já foi enviado", () => {
    const prazos = [base, { ...base, id: "p2", vencimento: "2026-12-08", interno: null }];
    const escolhidos = new Map([["u1", todos]]);
    expect(escolherAvisos(prazos, "2026-12-08", escolhidos, new Set()).get("u1")).toHaveLength(2);
    const enviados = new Set(["u1:p1:interno"]);
    expect(escolherAvisos(prazos, "2026-12-08", escolhidos, enviados).get("u1")).toHaveLength(1);
  });
  it("pula quem desligou os alertas", () => {
    expect(escolherAvisos([base], "2026-12-10", new Map(), new Set()).size).toBe(0);
  });
});

describe("montarEmail", () => {
  it("destaca o que vence hoje e escapa o HTML", () => {
    const email = montarEmail("Lucas", [
      { prazo: { ...base, partes: "<b>Ana</b>" }, momento: "fatal" },
    ]);
    expect(email.assunto).toBe("1 prazo vence hoje");
    expect(email.html).not.toContain("<b>Ana</b>");
    expect(email.texto).toContain("Vence hoje · fatal em 10/12/2026");
  });
});
