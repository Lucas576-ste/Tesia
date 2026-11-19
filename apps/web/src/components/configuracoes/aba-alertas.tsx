"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { salvarAlertas } from "@/app/app/configuracoes/alertas-acoes";
import { GrupoOpcoes } from "@/components/onboarding/grupo-opcoes";
import { usePlano } from "@/components/plano/provedor-plano";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOMENTOS_ALERTA, type MomentoAlerta, type PreferenciasAlerta } from "@/lib/alertas";

const CANAIS = ["E-mail"] as const;
const ROTULOS = Object.values(MOMENTOS_ALERTA);
type Rotulo = (typeof ROTULOS)[number];
const codigoDoRotulo = Object.fromEntries(
  Object.entries(MOMENTOS_ALERTA).map(([codigo, rotulo]) => [rotulo, codigo]),
) as Record<Rotulo, MomentoAlerta>;

export function AbaAlertas({ alertas }: { alertas: PreferenciasAlerta }) {
  const [canais, setCanais] = useState<(typeof CANAIS)[number][]>(alertas.email ? ["E-mail"] : []);
  const [dias, setDias] = useState<Rotulo[]>(alertas.dias.map((codigo) => MOMENTOS_ALERTA[codigo]));
  const [salvando, iniciar] = useTransition();
  const { id, plano } = usePlano();
  const planoStart = id === "start";
  const semAlerta = canais.length === 0 || dias.length === 0;

  function salvar() {
    iniciar(async () => {
      const resultado = await salvarAlertas({
        email: canais.includes("E-mail"),
        dias: dias.map((rotulo) => codigoDoRotulo[rotulo]),
      });
      if ("erro" in resultado) toast.error(resultado.erro);
      else toast.success("Alertas salvos. O resumo chega por e-mail às 7h.");
    });
  }

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
      <GrupoOpcoes legenda="Quando avisar" opcoes={ROTULOS} valor={dias} aoMudar={setDias} />
      {plano.equipe && (
        <p className="rounded-md bg-primaria-fundo px-3 py-2 text-sm">
          Rede de segurança: se um prazo seguir aberto na véspera do prazo fatal, os dois advogados
          são avisados.
        </p>
      )}
      {semAlerta && (
        <p role="status" className="rounded-md bg-atencao-fundo px-3 py-2 text-sm text-atencao">
          Sem canal ou antecedência, você não recebe aviso de prazo.
        </p>
      )}
      <Button className="w-full sm:w-auto sm:self-end" onClick={salvar} disabled={salvando}>
        {salvando ? "Salvando..." : "Salvar"}
      </Button>
    </Card>
  );
}
