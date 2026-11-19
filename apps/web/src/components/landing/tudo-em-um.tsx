import {
  Bell,
  Calculator,
  FileDown,
  FileSearch,
  LayoutDashboard,
  PenLine,
  Users,
  UsersRound,
} from "lucide-react";
import { RevelarItem, RevelarLista } from "./revelar";
import { SecaoLanding } from "./secao-landing";

const modulos = [
  {
    icone: FileSearch,
    titulo: "Intimações automáticas",
    texto:
      "A Tesia busca suas publicações no DJEN e recebe os pushes dos seus processos. Também aceita o PDF.",
  },
  {
    icone: Calculator,
    titulo: "Prazo com a conta",
    texto: "Dias úteis, feriados e o artigo de lei, passo a passo. Você confere e confirma.",
  },
  {
    icone: PenLine,
    titulo: "Peças com IA no seu estilo",
    texto: "Rascunhos com a sua estrutura e o seu tom, aprendidos das suas peças antigas.",
  },
  {
    icone: FileDown,
    titulo: ".docx com seu timbrado",
    texto: "Baixe pronto para protocolar, no seu papel, com os pontos a conferir marcados.",
  },
  {
    icone: Users,
    titulo: "Clientes e processos",
    texto: "Cada cliente com seus processos e a fase de cada um, do início ao arquivamento.",
  },
  {
    icone: LayoutDashboard,
    titulo: "Painel e quadro",
    texto: "O que vence hoje, o que está vencido e o que vem depois, num só lugar.",
  },
  {
    icone: Bell,
    titulo: "Alertas e agenda",
    texto: "E-mail antes do vencimento e os prazos no calendário do seu celular.",
  },
  {
    icone: UsersRound,
    titulo: "Trabalho em dupla",
    texto: "No plano Sócio, cada advogado com seu estilo e um responsável por prazo.",
  },
];

export function TudoEmUm() {
  return (
    <SecaoLanding fundo="branco" titulo="Tudo o que seu escritório precisa, num só lugar.">
      <p className="max-w-3xl text-lg text-texto-secundario">
        Chega de planilha, agenda de papel e cinco sistemas abertos. Da intimação ao protocolo, o
        seu fluxo inteiro fica organizado na Tesia.
      </p>
      <RevelarLista className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modulos.map(({ icone: Icone, titulo, texto }) => (
          <RevelarItem
            key={titulo}
            className="flex flex-col gap-2 rounded-xl border bg-card p-5 shadow-xs"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-(image:--dourado) text-menu">
              <Icone aria-hidden className="size-5" />
            </span>
            <h3 className="text-lg font-semibold">{titulo}</h3>
            <p className="text-base text-texto-secundario">{texto}</p>
          </RevelarItem>
        ))}
      </RevelarLista>
    </SecaoLanding>
  );
}
