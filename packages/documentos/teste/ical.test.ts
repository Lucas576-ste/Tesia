import { describe, expect, it } from "vitest";
import { dobrarLinha, escaparTextoIcal, montarIcal } from "../src/ical";

const agora = new Date("2026-11-18T12:00:00Z");

describe("montarIcal", () => {
  it("monta eventos de dia inteiro com UID estável e CRLF", () => {
    const ical = montarIcal(
      [
        {
          uid: "abc-fatal@tesia",
          titulo: "Recurso inominado · José x INSS",
          data: "2026-11-23",
          descricao: "Prazo fatal. Abrir na Tesia: https://tesia/app/intimacoes/1",
          url: "https://tesia/app/intimacoes/1",
        },
        {
          uid: "abc-interno@tesia",
          titulo: "Prazo interno · Recurso inominado",
          data: "2026-11-19",
        },
        { uid: "invalido", titulo: "x", data: "23/11/2026" },
      ],
      { nome: "Tesia – Prazos", agora },
    );
    expect(ical.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ical.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ical.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ical).toContain("UID:abc-fatal@tesia");
    expect(ical).toContain("DTSTART;VALUE=DATE:20261123\r\nDTEND;VALUE=DATE:20261124");
    expect(ical).toContain("DTSTAMP:20261118T120000Z");
    expect(ical).not.toContain("invalido");
    expect(ical.split("\r\n").every((linha) => !linha.includes("\n"))).toBe(true);
  });
});

describe("escape e dobra", () => {
  it("escapa vírgula, ponto e vírgula, barra e quebra de linha", () => {
    expect(escaparTextoIcal("a, b; c\\d\ne")).toBe("a\\, b\\; c\\\\d\\ne");
  });

  it("dobra linhas acima de 75 octetos sem quebrar acentos", () => {
    const linha = `SUMMARY:${"ção".repeat(40)}`;
    const dobrada = dobrarLinha(linha);
    for (const parte of dobrada.split("\r\n"))
      expect(Buffer.byteLength(parte, "utf8")).toBeLessThanOrEqual(75);
    expect(dobrada.replace(/\r\n /g, "")).toBe(linha);
  });
});
