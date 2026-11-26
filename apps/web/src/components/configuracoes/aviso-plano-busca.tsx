import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AvisoPlanoBusca({ pausada }: { pausada: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-texto-secundario">
        {pausada
          ? "Busca pausada no seu plano. Ela volta no plano Pro."
          : "A busca automática de intimações é do plano Pro."}
      </p>
      <Button size="sm" asChild>
        <Link href="/app/plano">Ver plano Pro</Link>
      </Button>
    </div>
  );
}
