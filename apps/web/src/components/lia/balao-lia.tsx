import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AvatarLia } from "./avatar-lia";

export function BalaoLia({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <AvatarLia />
      <p className="rounded-lg rounded-tl-none bg-primaria-fundo px-2 py-1.5 text-texto">
        {children}
      </p>
    </div>
  );
}
