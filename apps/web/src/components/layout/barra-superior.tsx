import { Bell, UserRound } from "lucide-react";
import Link from "next/link";
import { SeletorTema } from "@/components/tema/seletor-tema";
import { Button } from "@/components/ui/button";
import { BuscaGlobal } from "./busca-global";
import { MenuAdicionar } from "./menu-adicionar";
import { UsoMes } from "./uso-mes";

type BarraSuperiorProps = {
  uso: { usadas: number; limite: number };
};

export function BarraSuperior({ uso }: BarraSuperiorProps) {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-card px-4 md:px-6">
      <MenuAdicionar />
      <BuscaGlobal />
      <div className="ml-auto flex items-center gap-1">
        <Link
          href="/app/plano"
          aria-label="Ver plano e uso"
          className="mr-1 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <UsoMes {...uso} />
        </Link>
        <SeletorTema />
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell aria-hidden />
        </Button>
        <Button asChild variant="ghost" size="icon" className="md:hidden">
          <Link href="/app/configuracoes" aria-label="Conta">
            <UserRound aria-hidden />
          </Link>
        </Button>
      </div>
    </header>
  );
}
