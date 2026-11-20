"use client";

import { Pencil } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type CartaoEditavelProps = {
  titulo: string;
  leitura: ReactNode;
  edicao: (fechar: () => void) => ReactNode;
};

export function CartaoEditavel({ titulo, leitura, edicao }: CartaoEditavelProps) {
  const [editando, setEditando] = useState(false);

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-titulo">{titulo}</h2>
        {!editando && (
          <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
            <Pencil aria-hidden />
            Editar
          </Button>
        )}
      </div>
      {editando ? edicao(() => setEditando(false)) : leitura}
    </Card>
  );
}
