"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { buscarAgora } from "@/app/app/configuracoes/busca-oab-acoes";
import { Button } from "@/components/ui/button";

export function BotaoBuscarAgora() {
  const [ocupado, iniciar] = useTransition();

  function executar() {
    iniciar(async () => {
      const resultado = await buscarAgora();
      if ("erro" in resultado) toast.error(resultado.erro);
      else toast.success("A busca recomeça em alguns minutos.");
    });
  }

  return (
    <Button size="sm" variant="outline" disabled={ocupado} onClick={executar}>
      Buscar agora
    </Button>
  );
}
