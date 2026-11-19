import type { LinhaPrazo } from "@/lib/prazo";
import { nivelDoPrazo, textoDoPrazo, TOM_URGENCIA } from "@/lib/urgencia";
import { cn } from "@/lib/utils";

export function SeloUrgencia({ prazo, className }: { prazo: LinhaPrazo; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap tabular-nums",
        TOM_URGENCIA[nivelDoPrazo(prazo)],
        className,
      )}
    >
      {textoDoPrazo(prazo)}
    </span>
  );
}
