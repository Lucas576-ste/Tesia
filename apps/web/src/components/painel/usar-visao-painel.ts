"use client";

import { useCallback, useSyncExternalStore } from "react";

export type VisaoPainel = "lista" | "quadro";

const CHAVE = "tesia-visao-painel";
const ouvintes = new Set<() => void>();

function lerVisao(): VisaoPainel {
  try {
    return window.localStorage.getItem(CHAVE) === "quadro" ? "quadro" : "lista";
  } catch {
    return "lista";
  }
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function useVisaoPainel() {
  const visao = useSyncExternalStore<VisaoPainel>(assinar, lerVisao, () => "lista");

  const trocar = useCallback((nova: VisaoPainel) => {
    try {
      window.localStorage.setItem(CHAVE, nova);
    } catch {
      return;
    }
    ouvintes.forEach((ouvinte) => ouvinte());
  }, []);

  return [visao, trocar] as const;
}
