import { CalendarClock, FileSearch, FileText, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { EventoProcesso } from "@/lib/processos-exemplo";

const icones: Record<EventoProcesso["tipo"], LucideIcon> = {
  intimacao: FileSearch,
  prazo: CalendarClock,
  peca: FileText,
};

export function LinhaTempo({ eventos }: { eventos: EventoProcesso[] }) {
  return (
    <ol className="flex flex-col">
      {eventos.map(({ data, tipo, titulo, descricao, link }) => {
        const Icone = icones[tipo];
        return (
          <li key={`${data}-${titulo}`} className="group flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icone aria-hidden className="size-4 text-texto-secundario" />
              </span>
              <span aria-hidden className="w-px flex-1 bg-border group-last:hidden" />
            </div>
            <div className="flex min-w-0 flex-col pb-5 text-sm group-last:pb-0">
              <span className="text-xs text-texto-secundario tabular-nums">{data}</span>
              <span className="font-medium">{titulo}</span>
              <span className="text-texto-secundario">{descricao}</span>
              {link && (
                <Link href={link.href} className="w-fit py-1 text-primaria underline">
                  {link.rotulo}
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
