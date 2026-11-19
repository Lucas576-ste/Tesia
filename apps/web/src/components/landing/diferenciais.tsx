import { SecaoLanding } from "./secao-landing";
import { RevelarItem, RevelarLista } from "./revelar";

const destaques = [
  {
    titulo: "A Lia escreve como você.",
    texto: "Aprende com as suas peças antigas, não com um modelo genérico.",
  },
  {
    titulo: "Prazo com a conta à vista.",
    texto: "A IA lê o documento; o cálculo é feito por regras fixas, e você vê cada etapa.",
  },
  {
    titulo: "Nada de jurisprudência inventada sem aviso.",
    texto: "Toda citação aparece marcada para você conferir na fonte oficial.",
  },
];

export function Diferenciais() {
  return (
    <SecaoLanding titulo="Feita para escrever como você, não como uma máquina.">
      <RevelarLista className="grid gap-6 md:grid-cols-3">
        {destaques.map(({ titulo, texto }) => (
          <RevelarItem key={titulo}>
            <h3 className="text-lg font-semibold">{titulo}</h3>
            <p className="mt-1 text-sm text-texto-secundario">{texto}</p>
          </RevelarItem>
        ))}
      </RevelarLista>
    </SecaoLanding>
  );
}
