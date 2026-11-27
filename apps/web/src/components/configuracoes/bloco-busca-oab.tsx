"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { aceitarBuscaDaOab, pararBuscaDaOab } from "@/app/app/configuracoes/busca-oab-acoes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatarOabDaBusca, type OabDaBusca } from "@/lib/busca-oab";
import { AvisoPlanoBusca } from "./aviso-plano-busca";
import { ConviteBuscaOab } from "./convite-busca-oab";

const formatoDia = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
});

type BlocoBuscaOabProps = {
  oab: OabDaBusca | null;
  informouOab: boolean;
  aceitaEm: string | null;
  podeGerenciar: boolean;
  temPlano: boolean;
  aoMudar: (aceitaEm: string | null) => void;
};

export function BlocoBuscaOab({
  oab,
  informouOab,
  aceitaEm,
  podeGerenciar,
  temPlano,
  aoMudar,
}: BlocoBuscaOabProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, iniciar] = useTransition();
  if (!podeGerenciar) return null;

  function ativar() {
    iniciar(async () => {
      const resultado = await aceitarBuscaDaOab();
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      aoMudar(new Date().toISOString());
      toast.success(
        "Busca ativada. A primeira busca traz os últimos 7 dias e começa em instantes.",
      );
    });
  }

  function parar() {
    iniciar(async () => {
      const resultado = await pararBuscaDaOab();
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      aoMudar(null);
      setConfirmando(false);
      toast.success("Busca encerrada. As intimações já recebidas continuam na lista.");
    });
  }

  return (
    <Card id="busca-intimacoes" className="scroll-mt-24 gap-3 p-5">
      <h2 className="text-base font-semibold text-titulo">Busca de intimações</h2>
      {!temPlano && <AvisoPlanoBusca pausada={aceitaEm !== null} />}
      {aceitaEm ? (
        <>
          {temPlano && (
            <p className="text-sm">
              Buscando intimações da OAB{oab ? ` ${formatarOabDaBusca(oab)}` : ""} desde{" "}
              {formatoDia.format(new Date(aceitaEm))}. Depois da primeira busca, procuramos a cada 3
              horas, das 6h às 22h.
            </p>
          )}
          <div>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-texto-secundario"
              onClick={() => setConfirmando(true)}
            >
              Parar de buscar
            </Button>
          </div>
        </>
      ) : (
        temPlano && (
          <ConviteBuscaOab
            temOabValida={oab !== null}
            informouOab={informouOab}
            ocupado={ocupado}
            aoAceitar={ativar}
          />
        )
      )}
      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Parar de buscar?</DialogTitle>
            <DialogDescription>
              A Tesia deixa de buscar novas intimações da sua OAB. As que já chegaram continuam na
              lista. Para voltar, será preciso ativar a busca de novo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
            <Button disabled={ocupado} onClick={parar}>
              Parar de buscar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
