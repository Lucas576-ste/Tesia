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
import { etapasExemplo } from "@/lib/planos-exemplo";
import { assumirEtapas, etapasPadrao, proximaEtapa, ROTULOS_ETAPA } from "@/lib/etapas-prazo";
import { AlternarVisao } from "./alternar-visao";
import { FiltrosPrazos } from "./filtros-prazos";
import { MenuAcoesPrazo } from "./menu-acoes-prazo";
import { ModalPrazoInterno } from "./modal-prazo-interno";
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

const FILTROS_EQUIPE = {
  meus: "Meus",
  socio: "Do sócio",
  sem: "Sem responsável",
  todos: "Todos",
} as const;

type FiltroEquipe = keyof typeof FILTROS_EQUIPE;

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
  const [filtroEquipe, setFiltroEquipe] = useState<FiltroEquipe>("todos");
  const [etapas, setEtapas] = useState(etapasExemplo);
  const [prazos, setPrazos] = useState(prazosIniciais);
  const [aConfirmar, setAConfirmar] = useState<LinhaPrazo | null>(null);
  const [aEditarInterno, setAEditarInterno] = useState<LinhaPrazo | null>(null);

  const indicadores = contarIndicadores(prazos);
  const critico = prazoCritico(prazos);
  const eu = advogadoExemplo.nome;

  function etapasDoPrazo(id: string) {
    return etapas[id] ?? etapasPadrao(eu);
  }

  const comResponsavel = plano.equipe
    ? prazos.map((prazo) => {
        const { atual, responsaveis } = etapasDoPrazo(prazo.id);
        if (prazo.status === "protocolado") {
          return { ...prazo, responsavel: responsaveis.protocolar ?? eu };
        }
        if (prazo.tipo && prazo.tipo !== "prazo") return { ...prazo, responsavel: eu };
        return { ...prazo, etapa: atual, responsavel: responsaveis[atual] ?? undefined };
      })
    : prazos;
  const doEscopo = comResponsavel.filter(({ responsavel, etapa }) => {
    if (!plano.equipe || filtroEquipe === "todos") return true;
    if (filtroEquipe === "meus") return responsavel === eu;
    if (filtroEquipe === "socio") return Boolean(responsavel) && responsavel !== eu;
    return Boolean(etapa) && !responsavel;
  });
  const visiveis = ordenarPrazos(filtrarPrazos(doEscopo, filtro));

  function trocarStatus(id: string, status: LinhaPrazo["status"]) {
    setPrazos((atuais) => atuais.map((prazo) => (prazo.id === id ? { ...prazo, status } : prazo)));
  }

  function salvarPrazoInterno(id: string, prazoInterno: string) {
    setPrazos((atuais) =>
      atuais.map((prazo) => (prazo.id === id ? { ...prazo, prazoInterno } : prazo)),
    );
    setAEditarInterno(null);
    toast.success("Prazo interno alterado neste exemplo. Nada foi enviado.");
  }

  function concluirEtapa({ id, etapa }: LinhaPrazo) {
    const atuais = etapasDoPrazo(id);
    const proxima = proximaEtapa(atuais);
    if (!proxima) return;
    setEtapas((todas) => ({ ...todas, [id]: { ...atuais, atual: proxima } }));
    if (etapa === "elaborar") trocarStatus(id, "rascunho_pronto");
    toast.success(
      `${ROTULOS_ETAPA[proxima]} agora é com ${atuais.responsaveis[proxima] ?? eu}. Nada foi enviado.`,
    );
  }

  function assumirPrazo({ id }: LinhaPrazo) {
    setEtapas((todas) => ({ ...todas, [id]: assumirEtapas(etapasDoPrazo(id), eu) }));
    toast.success("O prazo agora é seu neste exemplo.");
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
      aoEditarInterno={setAEditarInterno}
      aoConcluirEtapa={concluirEtapa}
      aoAssumir={assumirPrazo}
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
                <AlternarVisao
                  visao={visao}
                  aoTrocar={trocarVisao}
                  quadroBloqueado={!plano.recursosPro}
                />
                {plano.equipe && (
                  <div
                    role="group"
                    aria-label="De quem são os prazos"
                    className="flex flex-wrap gap-1"
                  >
                    {(Object.keys(FILTROS_EQUIPE) as FiltroEquipe[]).map((valor) => (
                      <Button
                        key={valor}
                        size="sm"
                        variant={filtroEquipe === valor ? "secondary" : "ghost"}
                        aria-pressed={filtroEquipe === valor}
                        onClick={() => setFiltroEquipe(valor)}
                      >
                        {FILTROS_EQUIPE[valor]}
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
      <ModalPrazoInterno
        prazo={aEditarInterno}
        aoFechar={() => setAEditarInterno(null)}
        aoSalvar={salvarPrazoInterno}
      />
      <ModalPrazoManual
        aberto={novoPrazo && plano.recursosPro}
        processos={processos}
        aoFechar={fecharNovoPrazo}
        aoSalvar={salvarPrazoManual}
      />
    </div>
  );
}
