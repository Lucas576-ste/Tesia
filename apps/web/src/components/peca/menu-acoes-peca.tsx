"use client";

import { Copy, Download, FileText, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LinhaPeca } from "@/lib/pecas-exemplo";

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
        <DropdownMenuItem
          onSelect={() => toast.info("Demonstração: o arquivo .docx ainda não é gerado.")}
        >
          <Download aria-hidden />
          Baixar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info("Demonstração: a cópia ainda não é criada.")}>
          <Copy aria-hidden />
          Duplicar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
