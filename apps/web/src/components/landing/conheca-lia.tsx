import { BellRing, Calculator, FileSearch, PenLine } from "lucide-react";
import { AvatarLia } from "@/components/lia/avatar-lia";
import { SecaoLanding } from "./secao-landing";

const habilidades = [
  {
    icone: FileSearch,
    titulo: "Lê por você",
    texto: "Recebe a intimação, resume o que aconteceu e separa o que pode ser atacado.",
  },
  {
    icone: Calculator,
    titulo: "Explica a conta",
    texto: "Mostra o prazo passo a passo, para você conferir e confirmar com tranquilidade.",
  },
  {
    icone: PenLine,
    titulo: "Escreve do seu jeito",
    texto: "Prepara o rascunho com a sua estrutura e o seu tom, aprendidos das suas peças.",
  },
  {
    icone: BellRing,
    titulo: "Avisa com antecedência",
    texto: "Manda um e-mail antes do vencimento dos prazos que você confirmou.",
  },
];

export function ConhecaLia() {
  return (
    <SecaoLanding fundo="branco">
      <div className="flex items-center gap-4">
        <AvatarLia className="size-14 text-2xl" />
        <h2 className="text-3xl font-semibold md:text-4xl">Conheça a Lia, sua assistente de IA.</h2>
      </div>
      <p className="max-w-3xl text-lg text-texto-secundario">
        A Lia acompanha cada intimação com você, do PDF ao rascunho. Ela cuida do trabalho pesado e
        deixa a decisão onde ela deve estar: com você.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {habilidades.map(({ icone: Icone, titulo, texto }) => (
          <li key={titulo} className="rounded-xl border bg-fundo p-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primaria-fundo">
              <Icone aria-hidden className="size-5 text-primaria" />
            </span>
            <h3 className="mt-3 text-lg font-semibold">{titulo}</h3>
            <p className="mt-1 text-sm text-texto-secundario">{texto}</p>
          </li>
        ))}
      </ul>
      <p className="text-sm text-texto-secundario">
        A Lia é uma inteligência artificial, não uma pessoa. Tudo o que ela prepara passa pela sua
        revisão.
      </p>
    </SecaoLanding>
  );
}
