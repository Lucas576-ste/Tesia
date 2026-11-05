import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { Pendencia } from "./extensao-pendencias";

type PainelPendenciasProps = {
  pendencias: Pendencia[];
  aoEscolher: (pendencia: Pendencia) => void;
};

export function PainelPendencias({ pendencias, aoEscolher }: PainelPendenciasProps) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
      <h2 className="text-lg font-semibold">
        Pendências <span className="tabular-nums">({pendencias.length})</span>
      </h2>
      {pendencias.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-sucesso">
          <CheckCircle2 aria-hidden className="size-4 shrink-0" />
          Nenhuma pendência no texto.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {pendencias.map((pendencia) => (
            <li key={pendencia.de}>
              <button
                type="button"
                onClick={() => aoEscolher(pendencia)}
                className="flex w-full gap-2 rounded-md p-2 text-left text-sm outline-none hover:bg-atencao-fundo focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-atencao" />
                <span className="min-w-0 break-words">
                  {pendencia.texto.replace(/^\[CONFIRMAR:?\s*|\]$/g, "") || "Conferir este ponto"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
