import type { ReactNode } from "react";

type PassoAgendaProps = { numero: number; titulo: string; children: ReactNode };

export function PassoAgenda({ numero, titulo, children }: PassoAgendaProps) {
  return (
    <section className="flex gap-3">
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-(image:--dourado) text-sm font-bold text-menu"
      >
        {numero}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="text-sm font-semibold text-titulo">
          <span className="sr-only">Passo {numero}: </span>
          {titulo}
        </h3>
        {children}
      </div>
    </section>
  );
}
