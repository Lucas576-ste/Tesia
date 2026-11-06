import type { Metadata } from "next";
import { TelaIndicar } from "@/components/indicar/tela-indicar";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Indicar a Tesia · Tesia" };

export default function IndicarPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-3xl font-semibold text-titulo">Indicar a Tesia</h1>
          <Badge variant="secondary">Dados de exemplo</Badge>
        </div>
        <p className="text-sm text-texto-secundario">
          Quando o advogado indicado vira pagante, vocês dois ganham 1 mês grátis.
        </p>
      </header>
      <TelaIndicar />
    </div>
  );
}
