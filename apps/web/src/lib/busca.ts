export function normalizarBusca(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[.-]/g, "")
    .toLowerCase();
}
