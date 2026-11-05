import type { ReactNode } from "react";

type MolduraNavegadorProps = {
  legenda: string;
  children: ReactNode;
};

export function MolduraNavegador({ legenda, children }: MolduraNavegadorProps) {
  return (
    <figure className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div aria-hidden className="flex gap-1.5 border-b px-3 py-2">
        <span className="size-2.5 rounded-full bg-erro" />
        <span className="size-2.5 rounded-full bg-destaque" />
        <span className="size-2.5 rounded-full bg-sucesso" />
      </div>
      {children}
      <figcaption className="border-t bg-muted px-3 py-1.5 text-xs text-texto-secundario">
        {legenda}
      </figcaption>
    </figure>
  );
}
