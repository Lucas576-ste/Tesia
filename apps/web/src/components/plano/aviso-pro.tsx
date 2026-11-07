import { Lock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SeloPro() {
  return <Badge className="border-transparent bg-destaque text-menu">Pro</Badge>;
}

type AvisoProProps = {
  titulo: string;
  descricao: string;
};

export function AvisoPro({ titulo, descricao }: AvisoProProps) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <Lock aria-hidden className="size-4 text-texto-secundario" />
        <h2 className="text-lg font-semibold">{titulo}</h2>
        <SeloPro />
      </div>
      <p className="text-sm text-texto-secundario">{descricao}</p>
      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href="/app/plano">Ver o plano Pro</Link>
      </Button>
    </section>
  );
}
