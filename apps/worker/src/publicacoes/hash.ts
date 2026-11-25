import { createHash } from "node:crypto";
import { htmlParaTexto } from "@tesia/shared";

export function hashPublicacao(dados: {
  tribunal: string | null;
  numeroProcesso: string | null;
  publicadaEm: string;
  texto: string;
}) {
  const texto = htmlParaTexto(dados.texto).replace(/\s+/g, " ").trim().toLowerCase();
  return createHash("sha256")
    .update([dados.tribunal ?? "", dados.numeroProcesso ?? "", dados.publicadaEm, texto].join("|"))
    .digest("hex");
}

export function ufDoTribunal(sigla: string | null | undefined) {
  const alvo = (sigla ?? "").toUpperCase();
  const achado = alvo.match(/^TJ([A-Z]{2})$/);
  if (alvo === "TJDFT") return "DF";
  return achado?.[1] ?? null;
}
