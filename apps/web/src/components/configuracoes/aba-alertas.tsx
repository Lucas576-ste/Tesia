"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GrupoOpcoes } from "@/components/onboarding/grupo-opcoes";
import { usePlanoDemo } from "@/components/plano/provedor-plano-demo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DIAS_ANTECEDENCIA } from "@/lib/conta-exemplo";

const CANAIS = ["E-mail"] as const;

export function AbaAlertas() {
  const [canais, setCanais] = useState<(typeof CANAIS)[number][]>(["E-mail"]);
  const [dias, setDias] = useState<(typeof DIAS_ANTECEDENCIA)[number][]>([
    "5 dias úteis antes",
    "2 dias úteis antes",
    "No dia do prazo fatal",
    "No dia do prazo interno",
  ]);
  const planoStart = usePlanoDemo().id === "start";
  const semAlerta = canais.length === 0 || dias.length === 0;

  return (
    <Card className="flex flex-col gap-5 p-4">
      <GrupoOpcoes
        legenda="Canais"
        opcoes={CANAIS}
        emBreve={planoStart ? [] : ["WhatsApp"]}
        valor={canais}
        aoMudar={setCanais}
      />
      {planoStart && (
        <p className="text-sm text-texto-secundario">
          Alertas por WhatsApp fazem parte do plano Pro.
        </p>
      )}
      <GrupoOpcoes
        legenda="Quando avisar"
        opcoes={DIAS_ANTECEDENCIA}
        valor={dias}
        aoMudar={setDias}
      />
      {semAlerta && (
        <p role="status" className="rounded-md bg-atencao-fundo px-3 py-2 text-sm text-atencao">
          Sem canal ou antecedência, você não recebe aviso de prazo.
        </p>
      )}
      <Button
        className="w-full sm:w-auto sm:self-end"
        onClick={() => toast.success("Alertas salvos neste exemplo. Nada foi enviado.")}
      >
        Salvar
      </Button>
    </Card>
  );
}
