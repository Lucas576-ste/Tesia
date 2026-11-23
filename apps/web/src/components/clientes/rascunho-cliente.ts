import type { DadosCliente } from "@/lib/cliente-tipos";

const CHAVE = "tesia-rascunho-cliente";

export function lerRascunhoCliente(): Partial<DadosCliente> | null {
  try {
    const salvo = sessionStorage.getItem(CHAVE);
    return salvo ? (JSON.parse(salvo) as Partial<DadosCliente>) : null;
  } catch {
    return null;
  }
}

export function salvarRascunhoCliente(valores: Partial<DadosCliente>) {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(valores));
  } catch {
    return;
  }
}

export function limparRascunhoCliente() {
  try {
    sessionStorage.removeItem(CHAVE);
  } catch {
    return;
  }
}
