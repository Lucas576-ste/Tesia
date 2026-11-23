"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDrawerCliente } from "./provedor-cliente";

export function BotaoNovoCliente() {
  const { abrirNovo, rascunho } = useDrawerCliente();

  return (
    <Button
      variant="outline"
      onClick={abrirNovo}
      aria-label={rascunho ? "Novo cliente (há um rascunho)" : "Novo cliente"}
      className="relative max-md:size-9 max-md:px-0"
    >
      <UserPlus aria-hidden />
      <span className="hidden md:inline">Novo cliente</span>
      {rascunho && (
        <span aria-hidden className="absolute -top-1 -right-1 size-2.5 rounded-full bg-destaque" />
      )}
    </Button>
  );
}
