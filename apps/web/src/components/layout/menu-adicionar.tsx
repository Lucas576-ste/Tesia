"use client";

import { CalendarPlus, FilePlus2, FolderPlus, Plus } from "lucide-react";
import Link from "next/link";
import { SeloPro } from "@/components/plano/aviso-pro";
import { usePlanoDemo } from "@/components/plano/provedor-plano-demo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const opcoes = [
  { rotulo: "Nova intimação", href: "/app/intimacoes/nova", icone: FilePlus2 },
  { rotulo: "Novo prazo manual", href: "/app?novo=prazo", icone: CalendarPlus },
  { rotulo: "Novo processo", href: "/app/processos?novo=1", icone: FolderPlus },
];

export function MenuAdicionar() {
  const { recursosPro } = usePlanoDemo().plano;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Adicionar" className="max-md:size-9 max-md:px-0">
          <Plus aria-hidden />
          <span className="hidden md:inline">Adicionar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {opcoes.map(({ rotulo, href, icone: Icone }) => {
          const bloqueado = !recursosPro && href === "/app?novo=prazo";
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
  );
}
