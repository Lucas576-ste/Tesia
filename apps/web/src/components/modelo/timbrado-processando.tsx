import { Card } from "@/components/ui/card";

export function TimbradoProcessando({ nome }: { nome: string | null }) {
  return (
    <Card role="status" className="flex flex-col gap-3 p-6">
      <p className="text-base font-semibold text-titulo">Lendo seu timbrado…</p>
      {nome && <p className="truncate text-sm text-texto-secundario">{nome}</p>}
      <div
        role="progressbar"
        aria-label="Lendo seu timbrado"
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full w-2/3 animate-pulse rounded-full bg-(image:--dourado)" />
      </div>
    </Card>
  );
}
