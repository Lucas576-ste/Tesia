import { describe, expect, it } from "vitest";
import { contarUrgencias, textoUrgencia, urgencia } from "./urgencia";

const base = { concluido: false, diasUteis: 5, diasAtraso: 0, venceHoje: false };

describe("urgência", () => {
  it("classifica cada caso", () => {
    expect(urgencia({ ...base, diasAtraso: 3, diasUteis: 0 })).toBe("vencido");
    expect(urgencia({ ...base, venceHoje: true, diasUteis: 0 })).toBe("hoje");
    expect(urgencia({ ...base, diasUteis: 2 })).toBe("ate3");
    expect(urgencia(base)).toBe("mais3");
    expect(urgencia({ ...base, concluido: true, diasAtraso: 4 })).toBe("concluido");
  });

  it("nunca diz 'vence em' para data passada", () => {
    expect(textoUrgencia({ ...base, diasAtraso: 3, diasUteis: 0 })).toBe("Venceu há 3 dias");
    expect(textoUrgencia({ ...base, diasAtraso: 1, diasUteis: 0 })).toBe("Venceu há 1 dia");
    expect(textoUrgencia({ ...base, venceHoje: true, diasUteis: 0 })).toBe("Vence hoje");
    expect(textoUrgencia({ ...base, diasUteis: 1 })).toBe("Vence amanhã");
    expect(textoUrgencia({ ...base, diasUteis: 2 })).toBe("Faltam 2 dias úteis");
  });

  it("conta por nível", () => {
    const contagem = contarUrgencias([
      { ...base, diasAtraso: 2 },
      { ...base, venceHoje: true, diasUteis: 0 },
      { ...base, diasUteis: 3 },
      base,
    ]);
    expect(contagem).toMatchObject({ vencido: 1, hoje: 1, ate3: 1, mais3: 1 });
  });
});
