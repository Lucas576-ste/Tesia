import type { Metadata } from "next";
import { TelaEstilo } from "@/components/estilo/tela-estilo";
import { Badge } from "@/components/ui/badge";
import { pecasEstiloExemplo } from "@/lib/estilo-exemplo";

export const metadata: Metadata = { title: "Meu estilo · Tesia" };

export default function EstiloPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-3xl font-semibold text-titulo">Meu estilo</h1>
          <Badge variant="secondary">Dados de exemplo</Badge>
        </div>
        <p className="text-sm text-texto-secundario">
          A Lia usa estas peças para escrever os rascunhos do seu jeito.
        </p>
      </header>
      <TelaEstilo pecasIniciais={pecasEstiloExemplo} />
    </div>
  );
}
