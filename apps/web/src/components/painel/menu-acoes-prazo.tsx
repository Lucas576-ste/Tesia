"use client";

import { CircleCheck, FileSearch, FileText, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LinhaPrazo } from "@/lib/prazo";

type MenuAcoesPrazoProps = {
  prazo: LinhaPrazo;
  aoMarcar: (prazo: LinhaPrazo) => void;
};

export function MenuAcoesPrazo({ prazo, aoMarcar }: MenuAcoesPrazoProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${prazo.partes}`}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/app/intimacoes/${prazo.id}`}>
            <FileSearch aria-hidden />
            Abrir análise
          </Link>
        </DropdownMenuItem>
        {prazo.status !== "nao_iniciado" && (
          <DropdownMenuItem asChild>
            <Link href={`/app/pecas/${prazo.id}`}>
              <FileText aria-hidden />
              Abrir peça
            </Link>
          </DropdownMenuItem>
        )}
        {prazo.status !== "protocolado" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => aoMarcar(prazo)}>
              <CircleCheck aria-hidden />
              Marcar como protocolado
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
