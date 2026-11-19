export function urlSemNovo(
  parametros: Record<string, string | string[] | undefined>,
  base = "/app",
) {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(parametros)) {
    if (chave !== "novo" && typeof valor === "string") busca.set(chave, valor);
  }
  const texto = busca.toString();
  return texto ? `${base}?${texto}` : base;
}
