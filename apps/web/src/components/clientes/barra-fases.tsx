import { fasesDoRito } from "@tesia/shared";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type BarraFasesProps = {
  rito: string | null;
  fase: string | null;
  encerrado: boolean;
  compacta?: boolean;
};

export function BarraFases({ rito, fase, encerrado, compacta = false }: BarraFasesProps) {
  const fases = fasesDoRito(rito).filter((item) => item.codigo !== "arquivado" || encerrado);
  const atual = encerrado ? fases.length - 1 : fases.findIndex((item) => item.codigo === fase);

  return (
    <ol aria-label="Fases do processo" className="flex w-full items-start overflow-x-auto pb-1">
      {fases.map((item, indice) => {
        const feita = indice < atual || (encerrado && indice === atual);
        const corrente = indice === atual && !encerrado;
        return (
          <li
            key={item.codigo}
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5",
              compacta ? "min-w-0" : "min-w-20 shrink-0",
            )}
          >
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-0.5 flex-1",
                  indice === 0 ? "invisible" : feita || corrente ? "bg-primary" : "bg-borda",
                )}
              />
              <span
                aria-current={corrente ? "step" : undefined}
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full border-2",
                  compacta ? "size-4" : "size-6",
                  feita && "border-primary bg-primary text-primary-foreground",
                  corrente &&
                    "border-primary bg-(image:--dourado) shadow-[0_0_0_4px] shadow-primary/25",
                  !feita && !corrente && "border-borda bg-card",
                )}
              >
                {feita && <Check aria-hidden className={compacta ? "size-2.5" : "size-3.5"} />}
              </span>
              <span
                className={cn(
                  "h-0.5 flex-1",
                  indice === fases.length - 1
                    ? "invisible"
                    : indice < atual
                      ? "bg-primary"
                      : "bg-borda",
                )}
              />
            </div>
            {!compacta && (
              <span
                className={cn(
                  "px-1 text-center text-[11px] leading-tight",
                  corrente ? "font-semibold text-primaria" : "text-texto-secundario",
                )}
              >
                {item.nome}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
