import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function AvisoInfo({
  icone: Icone,
  titulo,
  children,
}: {
  icone: LucideIcon;
  titulo: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-borda bg-primaria-fundo p-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-texto">
        <Icone aria-hidden className="size-4 text-primaria" />
        {titulo}
      </p>
      {children}
    </div>
  );
}
