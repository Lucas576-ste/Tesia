"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { alternarAprendizadoContinuo } from "@/app/app/estilo/acoes";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function CardAprendizadoContinuo({ inicial }: { inicial: boolean }) {
  const [ligado, setLigado] = useState(inicial);
  const [pendente, iniciar] = useTransition();

  function alternar(valor: boolean) {
    const anterior = ligado;
    setLigado(valor);
    iniciar(async () => {
      const resultado = await alternarAprendizadoContinuo(valor);
      if ("erro" in resultado) {
        setLigado(anterior);
        toast.error(resultado.erro);
      }
    });
  }

  return (
    <Card className="flex-row items-start justify-between gap-4 p-5">
      <div className="flex flex-col gap-1">
        <h2 id="aprendizado-continuo" className="text-base font-semibold text-titulo">
          Aprender com suas revisões
        </h2>
        <p className="text-sm text-texto-secundario">
          A cada rascunho que você corrigir, a Lia ajusta seu estilo. Você pode desligar quando
          quiser.
        </p>
      </div>
      <Switch
        checked={ligado}
        disabled={pendente}
        onCheckedChange={alternar}
        aria-labelledby="aprendizado-continuo"
      />
    </Card>
  );
}
