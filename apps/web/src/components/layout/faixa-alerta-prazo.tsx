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
  padrao: {
    faixa: "bg-erro-fundo text-alerta-texto",
    botao: "border-alerta-texto/30 text-alerta-texto",
  },
  hoje: {
    faixa: "bg-erro text-white",
    botao: "border-white text-erro",
  },
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
        "flex flex-col gap-2 px-4 py-2 text-sm sm:flex-row sm:items-center md:px-6",
        estilo.faixa,
      )}
    >
      <p className="flex min-w-0 flex-1 items-start gap-2 sm:items-center">
        <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 sm:mt-0" />
        <span className="min-w-0 break-words">
          <span className="font-medium">
            {peca} · {partes}
          </span>{" "}
          vence {prazo}
        </span>
      </p>
      <Button asChild size="sm" variant="outline" className={estilo.botao}>
        <Link href={href}>Começar agora</Link>
      </Button>
    </div>
  );
}
