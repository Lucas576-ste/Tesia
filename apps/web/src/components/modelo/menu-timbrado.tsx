import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MenuTimbrado({ aoRemover }: { aoRemover: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Mais ações do timbrado">
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={aoRemover} className="text-erro">
          <Trash2 aria-hidden />
          Remover timbrado
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
