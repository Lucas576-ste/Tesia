export const TAMANHO_DO_BLOCO = 1000;

export async function lerEmBlocos<T>(
  ler: (indice: number, tamanho: number) => Promise<T[]>,
  limite: number,
  tamanho = TAMANHO_DO_BLOCO,
) {
  const lidas: T[] = [];
  for (let indice = 0; lidas.length < limite; indice += 1) {
    const bloco = await ler(indice, tamanho);
    lidas.push(...bloco);
    if (bloco.length < tamanho) break;
  }
  return lidas.slice(0, limite);
}
