"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { membrosEquipeExemplo } from "@/lib/planos-exemplo";

export function AbaEquipe() {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <ul className="rounded-md border">
        {membrosEquipeExemplo.map(({ id, nome, papel }) => (
          <li key={id} className="flex items-center gap-2 border-b p-2 text-sm last:border-b-0">
            <span className="min-w-0 flex-1 font-medium">{nome}</span>
            <Badge variant="secondary">{papel}</Badge>
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        className="w-full sm:w-auto sm:self-end"
        onClick={() => toast.info("Demonstração: nenhum convite foi enviado.")}
      >
        Convidar sócio
      </Button>
    </Card>
  );
}
