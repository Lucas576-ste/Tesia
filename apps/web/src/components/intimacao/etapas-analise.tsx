import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const ETAPAS = ["Lendo documento", "Identificando o ato", "Calculando prazo"];

export function EtapasAnalise({ atual }: { atual: number }) {
  return (
    <ol role="status" className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-sm">
      {ETAPAS.map((etapa, indice) => {
        const concluida = indice < atual;
        const ativa = indice === atual;
        const Icone = concluida ? CheckCircle2 : ativa ? LoaderCircle : Circle;
        return (
          <li
            key={etapa}
            aria-current={ativa ? "step" : undefined}
            className={cn(
              "flex items-center gap-2",
              concluida && "text-sucesso",
              ativa && "font-medium",
              !concluida && !ativa && "text-texto-secundario",
            )}
          >
            <Icone aria-hidden className={cn("size-4 shrink-0", ativa && "animate-spin")} />
            {etapa}
          </li>
        );
      })}
    </ol>
  );
}
