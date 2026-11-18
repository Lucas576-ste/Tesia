"use client";

import { Download, FileText, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LinhaPeca } from "@/lib/linha-peca";

export function MenuAcoesPeca({ peca }: { peca: LinhaPeca }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${peca.tipo}, ${peca.partes}`}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/app/pecas/${peca.id}`}>
            <FileText aria-hidden />
            Abrir
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/app/pecas/${peca.id}/docx`} download>
            <Download aria-hidden />
            Baixar .docx
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
