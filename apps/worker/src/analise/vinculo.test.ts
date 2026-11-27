import { describe, expect, it } from "vitest";
import { deveSalvarProcesso } from "./banco.js";

const vinculado = {
  processo_id: "00000000-0000-4000-8000-000000000001",
  numero_cnj: "0000001-00.2026.8.07.0001",
};

describe("vínculo da intimação na análise", () => {
  it("cria o processo quando a intimação ainda não tem vínculo", () => {
    expect(deveSalvarProcesso({ processo_id: null, numero_cnj: null }, null)).toBe(true);
  });

  it("completa o processo vinculado quando o número é o mesmo", () => {
    expect(deveSalvarProcesso(vinculado, vinculado.numero_cnj)).toBe(true);
  });

  it("não troca o vínculo quando a IA lê outro número ou nenhum", () => {
    expect(deveSalvarProcesso(vinculado, "0000002-00.2026.8.07.0001")).toBe(false);
    expect(deveSalvarProcesso(vinculado, null)).toBe(false);
  });
});
