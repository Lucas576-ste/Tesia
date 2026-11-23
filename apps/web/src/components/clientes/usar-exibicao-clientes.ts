import { useSyncExternalStore } from "react";

export type Exibicao = "cards" | "lista";

const CHAVE = "tesia-clientes-exibicao";

function assinar(aoMudar: () => void) {
  window.addEventListener(CHAVE, aoMudar);
  window.addEventListener("storage", aoMudar);
  return () => {
    window.removeEventListener(CHAVE, aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}

function ler(): Exibicao {
  try {
    return localStorage.getItem(CHAVE) === "lista" ? "lista" : "cards";
  } catch {
    return "cards";
  }
}

export function useExibicaoClientes() {
  const exibicao = useSyncExternalStore(assinar, ler, () => "cards" as const);

  function trocar(valor: Exibicao) {
    try {
      localStorage.setItem(CHAVE, valor);
    } catch {
      return;
    }
    window.dispatchEvent(new Event(CHAVE));
  }

  return [exibicao, trocar] as const;
}
