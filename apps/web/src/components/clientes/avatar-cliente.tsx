import { iniciais } from "@tesia/shared";
import { cn } from "@/lib/utils";

export function AvatarCliente({ nome, className }: { nome: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-primaria-fundo text-sm font-semibold text-primaria",
        className,
      )}
    >
      {iniciais(nome)}
    </span>
  );
}
