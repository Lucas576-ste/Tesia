import { UserRound } from "lucide-react";
import Link from "next/link";
import { BotaoSair } from "@/components/autenticacao/botao-sair";
import { SeletorTema } from "@/components/tema/seletor-tema";
import { Button } from "@/components/ui/button";
import { BotaoNovoCliente } from "@/components/clientes/botao-novo-cliente";
import { BuscaGlobal } from "./busca-global";
import { listarNotificacoes } from "@/lib/notificacoes";
import { MenuAdicionar } from "./menu-adicionar";
import { SinoNotificacoes } from "./sino-notificacoes";

export async function BarraSuperior() {
  const notificacoes = await listarNotificacoes();
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-card px-4 md:px-6">
      <MenuAdicionar />
      <BotaoNovoCliente />
      <BuscaGlobal />
      <div className="ml-auto flex items-center gap-1">
        <SeletorTema />
        <SinoNotificacoes notificacoes={notificacoes} />
        <Button asChild variant="ghost" size="icon" className="md:hidden">
          <Link href="/app/configuracoes" aria-label="Conta">
            <UserRound aria-hidden />
          </Link>
        </Button>
        <BotaoSair variante="icone" className="md:hidden" />
      </div>
    </header>
  );
}
