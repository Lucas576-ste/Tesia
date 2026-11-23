const PADRAO_CHAVE = /sk-ant-[A-Za-z0-9_-]+/;

export function extrairChave(valor: string | undefined) {
  return valor?.match(PADRAO_CHAVE)?.[0] ?? null;
}

export function descreverValor(valor: string) {
  return {
    tamanho: valor.length,
    comeca: valor.slice(0, 3),
    temAspas: /["']/.test(valor),
    temIgual: valor.includes("="),
    temEspaco: /\s/.test(valor),
  };
}
