import { Bell, CircleHelp, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { SeletorTema } from "@/components/tema/seletor-tema";
import { Button } from "@/components/ui/button";
import { BuscaGlobal } from "./busca-global";
import { usoExemplo } from "./dados-exemplo";
import { UsoMes } from "./uso-mes";

export function BarraSuperior() {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-card px-4 md:px-6">
      <Button asChild className="hidden md:inline-flex">
        <Link href="/app/intimacoes/nova">
          <Plus aria-hidden />
          Nova intimação
        </Link>
      </Button>
      <BuscaGlobal />
      <div className="ml-auto flex items-center gap-1">
        <UsoMes {...usoExemplo} className="mr-1" />
        <SeletorTema />
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell aria-hidden />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Ajuda">
          <CircleHelp aria-hidden />
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
