import { FileText, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PecaEstilo } from "@/lib/estilo";
import { StatusPeca } from "./status-peca";

export function ItemPeca({ peca, aoRemover }: { peca: PecaEstilo; aoRemover: () => void }) {
  return (
    <li className="flex flex-col gap-1 border-b p-3 text-sm last:border-b-0">
      <div className="flex items-center gap-2">
        <FileText aria-hidden className="size-4 shrink-0 text-texto-secundario" />
        <span className="min-w-0 flex-1 truncate font-medium" title={peca.nome}>
          {peca.nome}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Mais ações para ${peca.nome}`}>
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={aoRemover} className="text-erro">
              <Trash2 aria-hidden />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-6">
        {peca.status === "lido" ? (
          peca.tipo && <Badge variant="secondary">{peca.tipo}</Badge>
        ) : (
          <StatusPeca peca={peca} />
        )}
        <span className="text-xs text-texto-secundario tabular-nums">{peca.data}</span>
      </div>
    </li>
  );
}
