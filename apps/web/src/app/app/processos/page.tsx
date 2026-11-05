import type { Metadata } from "next";
import { ListaProcessos } from "@/components/processo/lista-processos";
import { Badge } from "@/components/ui/badge";
import { listarProcessos } from "@/lib/processos-exemplo";

export const metadata: Metadata = { title: "Processos · Tesia" };

export default function ProcessosPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-3xl font-semibold text-titulo">Processos</h1>
          <Badge variant="secondary">Dados de exemplo</Badge>
        </div>
        <p className="text-sm text-texto-secundario">
          A lista é criada a partir das intimações que você envia.
        </p>
      </header>
      <ListaProcessos processos={listarProcessos()} />
    </div>
  );
}
