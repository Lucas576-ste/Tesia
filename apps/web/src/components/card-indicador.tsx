import { AlertTriangle, CalendarClock, FilePen, Inbox } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tipos = {
  vencido: { icone: AlertTriangle, cor: "text-erro", ativo: "border-erro bg-erro-fundo" },
  vencimento: {
    icone: CalendarClock,
    cor: "text-atencao",
    ativo: "border-atencao bg-atencao-fundo",
  },
  rascunho: { icone: FilePen, cor: "text-primaria", ativo: "border-primary bg-primaria-fundo" },
  intimacao: { icone: Inbox, cor: "text-primaria", ativo: "border-primary bg-primaria-fundo" },
};

type CardIndicadorProps = {
  tipo: keyof typeof tipos;
  rotulo: string;
  valor: number;
  href: string;
  ativo?: boolean;
};

export function CardIndicador({ tipo, rotulo, valor, href, ativo = false }: CardIndicadorProps) {
  const { icone: Icone, cor, ativo: estiloAtivo } = tipos[tipo];

  return (
    <Link
      href={href}
      aria-current={ativo ? "true" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-xs transition-colors outline-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50",
        ativo && estiloAtivo,
      )}
    >
      <Icone
        aria-hidden
        className={cn("size-5 shrink-0", valor > 0 ? cor : "text-texto-secundario")}
      />
      <span className="min-w-0 flex-1 text-sm text-texto-secundario">{rotulo}</span>
      <span className={cn("text-2xl font-bold tabular-nums", valor > 0 ? cor : "text-texto")}>
        {valor}
      </span>
    </Link>
  );
}
