"use client";

import { CalendarPlus, FilePlus2, FolderPlus, Plus } from "lucide-react";
import Link from "next/link";
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
  const visiveis = opcoes.filter(({ href }) => recursosPro || href !== "/app?novo=prazo");

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Adicionar" className="max-md:size-9 max-md:px-0">
          <Plus aria-hidden />
          <span className="hidden md:inline">Adicionar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {visiveis.map(({ rotulo, href, icone: Icone }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href}>
              <Icone aria-hidden />
              {rotulo}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
