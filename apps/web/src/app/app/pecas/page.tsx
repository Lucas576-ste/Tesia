import type { Metadata } from "next";
import { ListaPecas } from "@/components/peca/lista-pecas";
import { Badge } from "@/components/ui/badge";
import { listarPecas } from "@/lib/pecas-exemplo";

export const metadata: Metadata = { title: "Peças · Tesia" };

export default function PecasPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-3xl font-semibold text-titulo">Peças</h1>
        <Badge variant="secondary">Dados de exemplo</Badge>
      </header>
      <ListaPecas pecas={listarPecas()} />
    </div>
  );
}
