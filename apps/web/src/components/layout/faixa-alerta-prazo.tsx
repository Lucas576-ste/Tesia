import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FaixaAlertaPrazoProps = {
  variante?: "padrao" | "hoje";
  peca: string;
  partes: string;
  prazo: string;
  href: string;
};

const estilos = {
  padrao: { filete: "border-l-atencao", icone: "text-atencao" },
  hoje: { filete: "border-l-erro", icone: "text-erro" },
};

export function FaixaAlertaPrazo({
  variante = "padrao",
  peca,
  partes,
  prazo,
  href,
}: FaixaAlertaPrazoProps) {
  const estilo = estilos[variante];

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-2 border-b border-l-4 bg-card px-4 py-2 text-sm text-texto sm:flex-row sm:items-center md:px-6",
        estilo.filete,
      )}
    >
      <p className="flex min-w-0 flex-1 items-start gap-2 sm:items-center">
        <TriangleAlert aria-hidden className={cn("mt-0.5 size-4 shrink-0 sm:mt-0", estilo.icone)} />
        <span className="min-w-0 break-words">
          <span className="font-medium">
            {peca} · {partes}
          </span>{" "}
          vence {prazo}
        </span>
      </p>
      <Button asChild size="sm" variant="outline">
        <Link href={href}>Começar agora</Link>
      </Button>
    </div>
  );
}
