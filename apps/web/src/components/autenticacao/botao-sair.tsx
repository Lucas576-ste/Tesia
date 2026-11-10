import { LogOut } from "lucide-react";
import { sair } from "@/app/(autenticacao)/acoes";
import { Button } from "@/components/ui/button";

export function BotaoSair() {
  return (
    <form action={sair}>
      <Button type="submit" variant="outline" size="sm">
        <LogOut aria-hidden className="size-4" />
        Sair da conta
      </Button>
    </form>
  );
}
