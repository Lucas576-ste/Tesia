export function valorDeFiltro(valor: string) {
  return `"${valor.replace(/[\\"]/g, "\\$&")}"`;
}
