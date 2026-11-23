"use client";

import { CalendarPlus, ChevronDown, FilePlus2, FolderPlus } from "lucide-react";
import Link from "next/link";
import { SeloPro } from "@/components/plano/aviso-pro";
import { usePlano } from "@/components/plano/provedor-plano";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const outras = [
  { rotulo: "Novo prazo manual", href: "/app/prazos?novo=prazo", icone: CalendarPlus, pro: true },
  {
    rotulo: "Novo processo",
    href: "/app/clientes?aba=processos&novo=1",
    icone: FolderPlus,
    pro: false,
  },
];

export function MenuAdicionar() {
  const { recursosPro } = usePlano().plano;

  return (
    <div className="flex items-center">
      <Button asChild className="rounded-r-none max-md:size-9 max-md:px-0">
        <Link href="/app/intimacoes/nova" aria-label="Nova intimação">
          <FilePlus2 aria-hidden />
          <span className="hidden md:inline">Nova intimação</span>
        </Link>
      </Button>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Mais opções para adicionar"
            className="w-8 rounded-l-none border-l border-black/10 px-0"
          >
            <ChevronDown aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {outras.map(({ rotulo, href, icone: Icone, pro }) => {
            const bloqueado = pro && !recursosPro;
            return (
              <DropdownMenuItem key={href} asChild>
                <Link href={bloqueado ? "/app/plano" : href}>
                  <Icone aria-hidden />
                  {rotulo}
                  {bloqueado && <SeloPro />}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
