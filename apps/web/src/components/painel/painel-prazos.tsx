"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CardIndicador } from "@/components/card-indicador";
import { EstadoVazio } from "@/components/estado-vazio";
import { FaixaAlertaPrazo } from "@/components/layout/faixa-alerta-prazo";
import { BalaoLia } from "@/components/lia/balao-lia";
import { TabelaPrazos } from "@/components/tabela-prazos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { filtrarPrazos, type FiltroPrazos } from "@/lib/filtros-prazos";
import { contarIndicadores, ordenarPrazos, prazoCritico, type LinhaPrazo } from "@/lib/prazo";
import { FiltrosPrazos } from "./filtros-prazos";
import { MenuAcoesPrazo } from "./menu-acoes-prazo";

type PainelPrazosProps = {
  nome: string;
  prazosIniciais: LinhaPrazo[];
  filtro: FiltroPrazos;
};

function resumoAbertos(quantidade: number) {
  if (quantidade === 0) return "Nenhum prazo em aberto";
  return quantidade === 1 ? "1 prazo em aberto" : `${quantidade} prazos em aberto`;
}

export function PainelPrazos({ nome, prazosIniciais, filtro }: PainelPrazosProps) {
  const [prazos, setPrazos] = useState(prazosIniciais);
  const [aConfirmar, setAConfirmar] = useState<LinhaPrazo | null>(null);

  const indicadores = contarIndicadores(prazos);
  const critico = prazoCritico(prazos);
  const visiveis = ordenarPrazos(filtrarPrazos(prazos, filtro));

  function trocarStatus(id: string, status: LinhaPrazo["status"]) {
    setPrazos((atuais) => atuais.map((prazo) => (prazo.id === id ? { ...prazo, status } : prazo)));
  }

  function confirmarProtocolo() {
    if (!aConfirmar) return;
    const { id, status } = aConfirmar;
    trocarStatus(id, "protocolado");
    setAConfirmar(null);
    toast.success("Prazo marcado como protocolado.", {
      action: { label: "Desfazer", onClick: () => trocarStatus(id, status) },
    });
  }

  let fala = "Nenhum prazo vence nos próximos 3 dias úteis.";
  if (critico) fala = `Comece por ${critico.peca} · ${critico.partes}, que vence ${critico.prazo}.`;
  if (prazos.length === 0) fala = "Assim que você enviar uma intimação, eu cuido do resto.";

  return (
    <div className="flex flex-col gap-5">
      {critico && (
        <div className="-mx-4 -mt-4 md:-mx-6">
          <FaixaAlertaPrazo {...critico} />
        </div>
      )}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-3xl font-semibold text-titulo">Olá, {nome}</h1>
            <Badge variant="secondary">Dados de exemplo</Badge>
          </div>
          <p className="text-texto-secundario">{resumoAbertos(indicadores.abertos)}</p>
          <BalaoLia className="text-sm">{fala}</BalaoLia>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <CardIndicador
            tipo="vencimento"
            rotulo="Vencem em até 3 dias"
            valor={indicadores.vencendo}
            href="/app?periodo=3-dias"
          />
          <CardIndicador
            tipo="rascunho"
            rotulo="Rascunhos para revisar"
            valor={indicadores.rascunhos}
            href="/app?status=rascunho_pronto"
          />
          <CardIndicador
            tipo="protocolado"
            rotulo="Protocolados no mês"
            valor={indicadores.protocolados}
            href="/app?status=protocolado"
          />
        </div>
        {prazos.length === 0 ? (
          <EstadoVazio
            titulo="Envie sua primeira intimação"
            descricao="Os prazos aparecem aqui depois que você envia e confirma a intimação."
            acao={
              <Button asChild>
                <Link href="/app/intimacoes/nova">Nova intimação</Link>
              </Button>
            }
          />
        ) : (
          <>
            <FiltrosPrazos filtro={filtro} />
            {visiveis.length === 0 ? (
              <EstadoVazio
                titulo="Nenhum prazo com esses filtros"
                descricao="Troque os filtros para ver outros prazos."
                acao={
                  <Button asChild variant="outline">
                    <Link href="/app">Limpar filtros</Link>
                  </Button>
                }
              />
            ) : (
              <Card className="gap-0 py-0">
                <TabelaPrazos
                  prazos={visiveis}
                  acoes={(prazo) => <MenuAcoesPrazo prazo={prazo} aoMarcar={setAConfirmar} />}
                />
              </Card>
            )}
          </>
        )}
      </div>
      <Dialog
        open={aConfirmar !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setAConfirmar(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como protocolado?</DialogTitle>
            <DialogDescription>
              {aConfirmar?.peca} · {aConfirmar?.partes}. Confirme só depois de protocolar no sistema
              do tribunal. O prazo sai da lista de abertos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={confirmarProtocolo}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
