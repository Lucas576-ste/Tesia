import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { ROTULOS_PECA_ESTILO, type PecaEstilo } from "@/lib/estilo";
import { cn } from "@/lib/utils";

export function StatusPeca({ peca }: { peca: PecaEstilo }) {
  if (peca.status === "erro") {
    return (
      <span className="flex items-center gap-1 text-xs text-erro">
        <CircleAlert aria-hidden className="size-4 shrink-0" />
        {peca.erro ?? ROTULOS_PECA_ESTILO.erro}
      </span>
    );
  }
  const lido = peca.status === "lido";
  const Icone = lido ? CheckCircle2 : LoaderCircle;
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs",
        lido ? "text-sucesso" : "text-texto-secundario",
      )}
    >
      <Icone aria-hidden className={cn("size-4 shrink-0", !lido && "animate-spin")} />
      {ROTULOS_PECA_ESTILO[peca.status]}
      {lido && peca.trechos > 0 && ` · ${peca.trechos} trechos`}
    </span>
  );
}
