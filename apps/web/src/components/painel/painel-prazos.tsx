"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CardIndicador } from "@/components/card-indicador";
import { EstadoVazio } from "@/components/estado-vazio";
import { advogadoExemplo } from "@/components/layout/dados-exemplo";
import { usePlano } from "@/components/plano/provedor-plano";
import { TabelaPrazos } from "@/components/tabela-prazos";
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
import {
  FILTRO_PADRAO,
  filtrarPrazos,
  filtroParaUrl,
  type FiltroPrazos,
} from "@/lib/filtros-prazos";
import { ordenarPrazos, statusSemConclusao, type LinhaPrazo } from "@/lib/prazo";
import { contagemDosPrazos } from "@/lib/urgencia";
import { alterarPrazoInterno, concluirPrazo, criarPrazoManual } from "@/app/app/acoes-prazos";
import type { PrazoManual, ProcessoResumo } from "@/lib/prazo-manual";
import { etapasExemplo } from "@/lib/planos-exemplo";
import { assumirEtapas, etapasPadrao, proximaEtapa, ROTULOS_ETAPA } from "@/lib/etapas-prazo";
import { AlternarVisao } from "./alternar-visao";
import { AtencaoAgora, montarAtencao } from "./atencao-agora";
import { ChipsFiltros } from "./chips-filtros";
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
  processoInicial?: string;
  urlSemNovo: string;
  intimacoes: { total: number; pendentes: number };
  modo?: "painel" | "prazos";
  aviso?: ReactNode;
};

const FILTROS_EQUIPE = {
  meus: "Meus",
  socio: "Do sócio",
  sem: "Sem responsável",
  todos: "Todos",
} as const;

type FiltroEquipe = keyof typeof FILTROS_EQUIPE;

export function PainelPrazos({
  nome,
  prazosIniciais,
  filtro,
  idsComAnalise,
  processos,
  novoPrazo,
  processoInicial,
  urlSemNovo,
  intimacoes,
  modo = "painel",
  aviso,
}: PainelPrazosProps) {
  const base = modo === "painel" ? "/app" : "/app/prazos";
  const router = useRouter();
  const [visaoSalva, trocarVisao] = useVisaoPainel();
  const { plano } = usePlano();
  const visao = plano.recursosPro ? visaoSalva : "lista";
  const [filtroEquipe, setFiltroEquipe] = useState<FiltroEquipe>("todos");
  const [etapas, setEtapas] = useState(etapasExemplo);
  const [prazos, setPrazos] = useState(prazosIniciais);
  const [aConfirmar, setAConfirmar] = useState<LinhaPrazo | null>(null);
  const [aEditarInterno, setAEditarInterno] = useState<LinhaPrazo | null>(null);

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

  async function salvarPrazoInterno(id: string, prazoInterno: string) {
    const prazoId = prazos.find((prazo) => prazo.id === id)?.prazoId;
    const [dia, mes, ano] = prazoInterno.split("/");
    if (prazoId) {
      const resultado = await alterarPrazoInterno(prazoId, `${ano}-${mes}-${dia}`);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
    }
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

  async function salvarPrazoManual(dados: PrazoManual) {
    const resultado = await criarPrazoManual(dados);
    if ("erro" in resultado) {
      toast.error(resultado.erro);
      return;
    }
    fecharNovoPrazo();
    toast.success("Adicionado ao painel e à sua agenda.");
    router.refresh();
  }

  async function desfazerConclusao(prazo: LinhaPrazo) {
    if (!(await mudarConclusao(prazo, false))) return;
    trocarStatus(prazo.id, statusSemConclusao(prazo));
    toast.success("Voltou para os pendentes.");
    router.refresh();
  }

  const acoes = (prazo: LinhaPrazo) => (
    <MenuAcoesPrazo
      prazo={prazo}
      temAnalise={idsComAnalise.includes(prazo.id)}
      aoMarcar={setAConfirmar}
      aoDesfazer={desfazerConclusao}
      aoEditarInterno={setAEditarInterno}
      aoConcluirEtapa={concluirEtapa}
      aoAssumir={assumirPrazo}
    />
  );

  async function mudarConclusao(prazo: LinhaPrazo, concluido: boolean) {
    if (!prazo.prazoId) return false;
    const resultado = await concluirPrazo(prazo.prazoId, concluido);
    if ("erro" in resultado) toast.error(resultado.erro);
    return !("erro" in resultado);
  }

  async function confirmarProtocolo() {
    if (!aConfirmar) return;
    const prazo = aConfirmar;
    setAConfirmar(null);
    if (!(await mudarConclusao(prazo, true))) return;
    trocarStatus(prazo.id, "protocolado");
    toast.success(prazo.tipo ? "Marcado como cumprido." : "Prazo marcado como protocolado.", {
      action: {
        label: "Desfazer",
        onClick: async () => {
          if (await mudarConclusao(prazo, false)) trocarStatus(prazo.id, prazo.status);
        },
      },
    });
  }

  const contagem = contagemDosPrazos(prazos);
  const atencao = montarAtencao(prazos, intimacoes.pendentes);
  const comFiltro = (parcial: Partial<FiltroPrazos>) =>
    filtroParaUrl({ ...FILTRO_PADRAO, ...parcial }, base);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex w-full flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-titulo">
            {modo === "painel" ? `Olá, ${nome}` : "Prazos"}
          </h1>
          {modo === "prazos" && (
            <p className="text-sm text-texto-secundario">
              Todos os prazos, audiências e compromissos confirmados, do mais urgente ao mais
              distante.
            </p>
          )}
        </header>
        {aviso}
        {modo === "painel" && <AtencaoAgora itens={atencao} />}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CardIndicador
            tipo="vencido"
            rotulo="Vencidos"
            valor={contagem.vencido}
            href={filtro.urgencia === "vencido" ? base : comFiltro({ urgencia: "vencido" })}
            ativo={filtro.urgencia === "vencido"}
          />
          <CardIndicador
            tipo="vencimento"
            rotulo="Vencem em até 3 dias"
            valor={contagem.ate3ComHoje}
            href={filtro.urgencia === "3-dias" ? base : comFiltro({ urgencia: "3-dias" })}
            ativo={filtro.urgencia === "3-dias"}
          />
          <CardIndicador
            tipo="rascunho"
            rotulo="Rascunhos para revisar"
            valor={contagem.rascunhos}
            href={
              filtro.status === "rascunho_pronto" ? base : comFiltro({ status: "rascunho_pronto" })
            }
            ativo={filtro.status === "rascunho_pronto"}
          />
          <CardIndicador
            tipo="intimacao"
            rotulo="Intimações novas"
            valor={intimacoes.pendentes}
            href="/app/intimacoes?filtro=aguardando"
          />
        </div>
        {prazos.length === 0 && intimacoes.total > 0 ? (
          <EstadoVazio
            titulo="Nenhum prazo confirmado ainda"
            descricao="Os prazos aparecem aqui depois que você confere e confirma cada intimação."
            acao={
              <Button asChild variant="outline">
                <Link href="/app/intimacoes">Ver intimações</Link>
              </Button>
            }
          />
        ) : prazos.length === 0 ? (
          <EstadoVazio
            titulo="Envie sua primeira intimação"
            descricao="Os prazos aparecem aqui depois que você envia e confirma a intimação."
            acao={
              <Button asChild>
                <Link href="/app/intimacoes/nova">Enviar intimação</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
                <ChipsFiltros filtro={filtro} base={base} />
              </div>
            </div>
            {visiveis.length === 0 ? (
              <EstadoVazio
                titulo="Nenhum prazo com esses filtros"
                descricao="Troque os filtros para ver outros prazos."
                acao={
                  <Button asChild variant="outline">
                    <Link href={base}>Limpar filtros</Link>
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
        processoInicial={processoInicial}
        aoFechar={fecharNovoPrazo}
        aoSalvar={salvarPrazoManual}
      />
    </div>
  );
}
