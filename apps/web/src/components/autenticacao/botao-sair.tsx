import { LogOut } from "lucide-react";
import { sair } from "@/app/(autenticacao)/acoes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BotaoSairProps = {
  variante?: "texto" | "icone";
  className?: string;
};

export function BotaoSair({ variante = "texto", className }: BotaoSairProps) {
  if (variante === "icone") {
    return (
      <form action={sair} className={className}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Sair da conta"
          title="Sair da conta"
        >
          <LogOut aria-hidden />
        </Button>
      </form>
    );
  }
  return (
    <form action={sair} className={className}>
      <Button type="submit" variant="outline" size="sm">
        <LogOut aria-hidden className="size-4" />
        Sair da conta
      </Button>
    </form>
  );
}
