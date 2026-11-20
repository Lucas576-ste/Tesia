"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { salvarDjen } from "@/app/app/configuracoes/alertas-acoes";
import { usePlano } from "@/components/plano/provedor-plano";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { DadosDjen } from "@/lib/alertas";
import { isoParaData } from "@/lib/prazo-interno";

export function BuscaDjen({ djen }: { djen: DadosDjen }) {
  const { plano } = usePlano();
  const [ativo, setAtivo] = useState(djen.ativo);
  const [salvando, iniciar] = useTransition();

  function mudar(valor: boolean) {
    iniciar(async () => {
      const resultado = await salvarDjen(valor);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      setAtivo(valor);
      toast.success(
        valor
          ? "Pronto. Vou buscar suas intimações no DJEN algumas vezes por dia."
          : "Busca no DJEN desligada.",
      );
    });
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">Buscar minhas intimações no DJEN</h3>
          <p className="text-sm text-texto-secundario">
            {djen.oab
              ? `A Lia procura as publicações da OAB ${djen.oab} no Diário de Justiça Eletrônico Nacional e analisa sozinha. Intimações pessoais pelo portal do tribunal continuam pelo envio do PDF.`
              : "Cadastre sua OAB no perfil para ligar a busca automática."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm font-medium">
          <Switch
            id="busca-djen"
            checked={ativo}
            disabled={salvando || !plano.recursosPro || !djen.oab}
            onCheckedChange={mudar}
          />
          <label htmlFor="busca-djen">{ativo ? "Ligada" : "Desligada"}</label>
        </div>
      </div>
      {!plano.recursosPro && (
        <p className="text-sm text-texto-secundario">A busca automática faz parte do plano Pro.</p>
      )}
      {djen.buscadoAte && (
        <p className="text-xs text-texto-secundario">
          Última busca: publicações até {isoParaData(djen.buscadoAte)}.
        </p>
      )}
    </Card>
  );
}
