import { cn } from "@/lib/utils";

export function AvatarLia({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full bg-destaque font-serif text-sm font-semibold text-menu",
        className,
      )}
    >
      L
    </span>
  );
}
