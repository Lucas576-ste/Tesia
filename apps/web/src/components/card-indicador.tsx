import { CalendarClock, CircleCheck, FilePen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tipos = {
  vencimento: { icone: CalendarClock, cor: "text-erro" },
  rascunho: { icone: FilePen, cor: "text-atencao" },
  protocolado: { icone: CircleCheck, cor: "text-sucesso" },
};

type CardIndicadorProps = {
  tipo: keyof typeof tipos;
  rotulo: string;
  valor: number;
  href: string;
};

export function CardIndicador({ tipo, rotulo, valor, href }: CardIndicadorProps) {
  const { icone: Icone, cor } = tipos[tipo];

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 shadow-xs transition-colors outline-none hover:border-primaria focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <Icone aria-hidden className="size-5 shrink-0 text-texto-secundario" />
      <span className="min-w-0 flex-1 text-sm text-texto-secundario">{rotulo}</span>
      <span
        className={cn(
          "font-serif text-2xl font-semibold tabular-nums",
          valor > 0 ? cor : "text-texto",
        )}
      >
        {valor}
      </span>
    </Link>
  );
}
