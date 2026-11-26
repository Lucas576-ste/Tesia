import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONS = {
  fato: "border-border bg-card",
  decisao: "border-primaria bg-primaria-fundo",
  prazo: "border-texto-secundario bg-secondary",
};

type TopicoDaDecisaoProps = {
  tom: keyof typeof TONS;
  icone: LucideIcon;
  titulo: string;
  children: ReactNode;
};

export function TopicoDaDecisao({ tom, icone: Icone, titulo, children }: TopicoDaDecisaoProps) {
  return (
    <div className={cn("rounded-md border border-l-4 p-3", TONS[tom])}>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-titulo">
        <Icone aria-hidden className="size-4 shrink-0" />
        {titulo}
      </h3>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
