import { SecaoLanding } from "./secao-landing";

const cards = [
  {
    titulo: "A intimação chega à noite.",
    texto: "Você lê a decisão inteira só para entender o que mudou e o que precisa ser feito.",
  },
  {
    titulo: "O prazo depende de você.",
    texto:
      "Dias úteis, feriado local, suspensão do tribunal. Você confere duas vezes e ainda fica a dúvida.",
  },
  {
    titulo: "A peça começa do zero.",
    texto:
      "Você abre um modelo antigo, troca nomes, adapta argumentos e perde horas no que já fez dezenas de vezes.",
  },
  {
    titulo: "A IA genérica não ajuda.",
    texto:
      "O texto sai com cara de robô, sem os dados do processo, e às vezes cita jurisprudência que não existe.",
  },
];

export function Dor() {
  return (
    <SecaoLanding
      fundo="escuro"
      titulo="Você estudou Direito para advogar, não para contar dias no calendário."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {cards.map(({ titulo, texto }) => (
          <li key={titulo} className="rounded-xl bg-menu-ativo p-5">
            <h3 className="text-lg font-semibold">{titulo}</h3>
            <p className="mt-1 text-sm text-menu-texto">{texto}</p>
          </li>
        ))}
      </ul>
    </SecaoLanding>
  );
}
