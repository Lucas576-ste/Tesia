import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function BotaoEnviar({ pendente, children }: { pendente: boolean; children: ReactNode }) {
  return (
    <Button type="submit" className="w-full" disabled={pendente} aria-busy={pendente}>
      {pendente && <Loader2 aria-hidden className="size-4 animate-spin" />}
      {children}
    </Button>
  );
}
