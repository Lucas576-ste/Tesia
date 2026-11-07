"use client";

import { CalendarClock, CircleCheck, FileSearch, FileText, MoreHorizontal } from "lucide-react";
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
  temAnalise: boolean;
  aoMarcar: (prazo: LinhaPrazo) => void;
  aoEditarInterno: (prazo: LinhaPrazo) => void;
};

export function MenuAcoesPrazo({
  prazo,
  temAnalise,
  aoMarcar,
  aoEditarInterno,
}: MenuAcoesPrazoProps) {
  const temPeca = !prazo.tipo && prazo.status !== "nao_iniciado";
  const temLinks = temAnalise || temPeca;

  if (!temLinks && prazo.status === "protocolado") return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${prazo.partes}`}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {temAnalise && (
          <DropdownMenuItem asChild>
            <Link href={`/app/intimacoes/${prazo.id}`}>
              <FileSearch aria-hidden />
              Abrir análise
            </Link>
          </DropdownMenuItem>
        )}
        {temPeca && (
          <DropdownMenuItem asChild>
            <Link href={`/app/pecas/${prazo.id}`}>
              <FileText aria-hidden />
              Abrir peça
            </Link>
          </DropdownMenuItem>
        )}
        {prazo.status !== "protocolado" && (
          <>
            {temLinks && <DropdownMenuSeparator />}
            {prazo.prazoInterno && (
              <DropdownMenuItem onSelect={() => aoEditarInterno(prazo)}>
                <CalendarClock aria-hidden />
                Editar prazo interno
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => aoMarcar(prazo)}>
              <CircleCheck aria-hidden />
              {prazo.tipo ? "Marcar como cumprido" : "Marcar como protocolado"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
