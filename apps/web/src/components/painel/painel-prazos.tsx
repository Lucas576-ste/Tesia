"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CardIndicador } from "@/components/card-indicador";
import { EstadoVazio } from "@/components/estado-vazio";
import { advogadoExemplo } from "@/components/layout/dados-exemplo";
import { FaixaAlertaPrazo } from "@/components/layout/faixa-alerta-prazo";
import { BalaoLia } from "@/components/lia/balao-lia";
import { usePlanoDemo } from "@/components/plano/provedor-plano-demo";
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
import { criarPrazoManual, type PrazoManual, type ProcessoResumo } from "@/lib/prazo-manual";
import { responsaveisExemplo } from "@/lib/planos-exemplo";
import { AlternarVisao } from "./alternar-visao";
import { FiltrosPrazos } from "./filtros-prazos";
import { MenuAcoesPrazo } from "./menu-acoes-prazo";
import { ModalPrazoManual } from "./modal-prazo-manual";
import { QuadroPrazos } from "./quadro-prazos";
import { useVisaoPainel } from "./usar-visao-painel";

type PainelPrazosProps = {
  nome: string;
  prazosIniciais: LinhaPrazo[];
  filtro: FiltroPrazos;
  idsComAnalise: string[];
  processos: ProcessoResumo[];
  novoPrazo: boolean;
  urlSemNovo: string;
};

function resumoAbertos(quantidade: number) {
  if (quantidade === 0) return "Nenhum prazo em aberto";
  return quantidade === 1 ? "1 prazo em aberto" : `${quantidade} prazos em aberto`;
}

export function PainelPrazos({
  nome,
  prazosIniciais,
  filtro,
  idsComAnalise,
  processos,
  novoPrazo,
  urlSemNovo,
}: PainelPrazosProps) {
  const router = useRouter();
  const [visaoSalva, trocarVisao] = useVisaoPainel();
  const { plano } = usePlanoDemo();
  const visao = plano.recursosPro ? visaoSalva : "lista";
  const [soMeus, setSoMeus] = useState(false);
  const [prazos, setPrazos] = useState(prazosIniciais);
  const [aConfirmar, setAConfirmar] = useState<LinhaPrazo | null>(null);

  const indicadores = contarIndicadores(prazos);
  const critico = prazoCritico(prazos);
  const comResponsavel = plano.equipe
    ? prazos.map((prazo) => ({
        ...prazo,
        responsavel: responsaveisExemplo[prazo.id] ?? advogadoExemplo.nome,
      }))
    : prazos;
  const doEscopo =
    plano.equipe && soMeus
      ? comResponsavel.filter(({ responsavel }) => responsavel === advogadoExemplo.nome)
      : comResponsavel;
  const visiveis = ordenarPrazos(filtrarPrazos(doEscopo, filtro));

  function trocarStatus(id: string, status: LinhaPrazo["status"]) {
    setPrazos((atuais) => atuais.map((prazo) => (prazo.id === id ? { ...prazo, status } : prazo)));
  }

  function fecharNovoPrazo() {
    router.replace(urlSemNovo, { scroll: false });
  }

  function salvarPrazoManual(dados: PrazoManual) {
    const novo = criarPrazoManual(crypto.randomUUID(), dados, processos);
    setPrazos((atuais) => [...atuais, novo]);
    fecharNovoPrazo();
    toast.success("Adicionado ao painel neste exemplo. Nada foi enviado.");
  }

  const acoes = (prazo: LinhaPrazo) => (
    <MenuAcoesPrazo
      prazo={prazo}
      temAnalise={idsComAnalise.includes(prazo.id)}
      aoMarcar={setAConfirmar}
    />
  );

  function confirmarProtocolo() {
    if (!aConfirmar) return;
    const { id, status, tipo } = aConfirmar;
    trocarStatus(id, "protocolado");
    setAConfirmar(null);
    toast.success(tipo ? "Marcado como cumprido." : "Prazo marcado como protocolado.", {
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
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {plano.recursosPro && <AlternarVisao visao={visao} aoTrocar={trocarVisao} />}
                {plano.equipe && (
                  <div role="group" aria-label="De quem são os prazos" className="flex gap-1">
                    {[
                      { rotulo: "Meus prazos", valor: true },
                      { rotulo: "Todos", valor: false },
                    ].map(({ rotulo, valor }) => (
                      <Button
                        key={rotulo}
                        size="sm"
                        variant={soMeus === valor ? "secondary" : "ghost"}
                        aria-pressed={soMeus === valor}
                        onClick={() => setSoMeus(valor)}
                      >
                        {rotulo}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <FiltrosPrazos filtro={filtro} />
            </div>
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
            ) : visao === "quadro" ? (
              <QuadroPrazos prazos={visiveis} acoes={acoes} aoConcluir={setAConfirmar} />
            ) : (
              <Card className="gap-0 py-0">
                <TabelaPrazos prazos={visiveis} acoes={acoes} />
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
            <DialogTitle>
              {aConfirmar?.tipo ? "Marcar como cumprido?" : "Marcar como protocolado?"}
            </DialogTitle>
            <DialogDescription>
              {aConfirmar?.peca} · {aConfirmar?.partes}.{" "}
              {aConfirmar?.tipo
                ? "O item sai da lista de abertos."
                : "Confirme só depois de protocolar no sistema do tribunal. O prazo sai da lista de abertos."}
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
      <ModalPrazoManual
        aberto={novoPrazo && plano.recursosPro}
        processos={processos}
        aoFechar={fecharNovoPrazo}
        aoSalvar={salvarPrazoManual}
      />
    </div>
  );
}
