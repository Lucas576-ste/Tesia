import type { ReactNode } from "react";
import { BalaoLia } from "@/components/lia/balao-lia";

export function CabecalhoPasso({ titulo, fala }: { titulo: string; fala: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold md:text-3xl">{titulo}</h1>
      <BalaoLia className="text-sm">{fala}</BalaoLia>
    </div>
  );
}
