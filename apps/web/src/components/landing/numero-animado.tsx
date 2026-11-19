"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

function partes(valor: string) {
  const encontrado = /^([\d.,]+)(.*)$/.exec(valor);
  if (!encontrado) return null;
  const [, numero = "", sufixo = ""] = encontrado;
  const decimais = numero.includes(",") ? (numero.split(",")[1]?.length ?? 0) : 0;
  const alvo = Number(numero.replaceAll(".", "").replace(",", "."));
  return Number.isFinite(alvo) ? { alvo, decimais, sufixo } : null;
}

export function NumeroAnimado({ valor }: { valor: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visivel = useInView(ref, { once: true, amount: 0.6 });
  const reduzir = useReducedMotion();
  const [texto, setTexto] = useState(valor);

  useEffect(() => {
    const dados = partes(valor);
    if (!visivel || reduzir || !dados) return;
    const formato = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: dados.decimais,
      maximumFractionDigits: dados.decimais,
    });
    const controle = animate(0, dados.alvo, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (atual) => setTexto(`${formato.format(atual)}${dados.sufixo}`),
    });
    return () => controle.stop();
  }, [visivel, reduzir, valor]);

  return (
    <span ref={ref} className="tabular-nums">
      {texto}
    </span>
  );
}
