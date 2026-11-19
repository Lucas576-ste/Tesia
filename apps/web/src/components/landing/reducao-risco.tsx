import { BadgeCheck, CreditCard, Headset, LogOut } from "lucide-react";
import { RevelarItem, RevelarLista } from "./revelar";

const itens = [
  {
    icone: CreditCard,
    titulo: "Teste sem cartão",
    texto: "7 dias grátis, sem cobrança automática no fim.",
  },
  {
    icone: BadgeCheck,
    titulo: "Sem taxa de ativação",
    texto: "Você paga só a mensalidade do plano.",
  },
  {
    icone: Headset,
    titulo: "Suporte humano",
    texto: "Fale com a gente pelo WhatsApp quando precisar.",
  },
  { icone: LogOut, titulo: "Cancele quando quiser", texto: "E leve todas as suas peças com você." },
];

export function ReducaoRisco() {
  return (
    <RevelarLista className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {itens.map(({ icone: Icone, titulo, texto }) => (
        <RevelarItem key={titulo} className="flex gap-3 rounded-xl border bg-card p-4">
          <Icone aria-hidden className="mt-0.5 size-5 shrink-0 text-primaria" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{titulo}</span>
            <span className="text-xs text-texto-secundario">{texto}</span>
          </div>
        </RevelarItem>
      ))}
    </RevelarLista>
  );
}
