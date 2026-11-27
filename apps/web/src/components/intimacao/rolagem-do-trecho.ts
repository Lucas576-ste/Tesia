export function emUmaColuna() {
  return window.matchMedia("(max-width: 1023px)").matches;
}

export function mostrarTrecho(id: string) {
  const bloco = document.getElementById(`trecho-${id}`);
  const celular = emUmaColuna();
  const alvo = celular ? (bloco?.querySelector("mark") ?? bloco) : bloco;
  alvo?.scrollIntoView({ block: celular ? "center" : "nearest", behavior: "smooth" });
}
