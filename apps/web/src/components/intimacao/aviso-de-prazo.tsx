import { TriangleAlert } from "lucide-react";

export function AvisoDePrazo({ texto }: { texto: string | null }) {
  if (!texto) return null;
  return (
    <p role="note" className="flex gap-2 rounded-md bg-atencao-fundo p-2 text-sm text-atencao">
      <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      {texto}
    </p>
  );
}
