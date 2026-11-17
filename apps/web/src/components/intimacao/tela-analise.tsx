"use client";

import { ArrowLeft, Quote, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { gerarRascunho } from "@/app/app/intimacoes/acoes";
import { toast } from "sonner";
import { BalaoLia } from "@/components/lia/balao-lia";
import { AvisoPro } from "@/components/plano/aviso-pro";
import { ModalLimite } from "@/components/plano/modal-limite";
import { usePlanoDemo } from "@/components/plano/provedor-plano-demo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Analise } from "@/lib/analise";
import type { UsoPecas } from "@/lib/uso-pecas";
import { BlocoPrazo } from "./bloco-prazo";
import { DocumentoOriginal } from "./documento-original";
import { EscolhaPeca } from "./escolha-peca";

function textoPontos(quantidade: number) {
  const pontos = quantidade === 1 ? "1 ponto" : `${quantidade} pontos`;
  return `A Lia encontrou ${pontos} nesta intimação. Veja cada um com o trecho do documento no plano Pro.`;
}

const conteudoAba = "data-[state=inactive]:hidden lg:data-[state=inactive]:block";

export function TelaAnalise({ analise, uso }: { analise: Analise; uso: UsoPecas }) {
  const [aba, setAba] = useState("analise");
  const [destaque, setDestaque] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(analise.confirmado);
  const router = useRouter();
  const { plano } = usePlanoDemo();
  const [pecaEscolhida, setPecaEscolhida] = useState(analise.pecas[0]?.codigo);
  const [gerando, iniciar] = useTransition();
  const [limiteAberto, setLimiteAberto] = useState(false);
  const restantes = uso.limite - uso.usadas;

  useEffect(() => {
    if (!destaque) return;
    document
      .getElementById(`trecho-${destaque}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [destaque, aba]);

  function gerar() {
    if (!pecaEscolhida) return;
    iniciar(async () => {
      const resultado = await gerarRascunho(analise.id, pecaEscolhida);
      if ("limite" in resultado) {
        setLimiteAberto(true);
        return;
      }
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      router.push(`/app/pecas/${resultado.id}`);
    });
  }

  function verTrecho(trechoId: string) {
    setDestaque(trechoId);
    setAba("documento");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/app">
          <ArrowLeft aria-hidden />
          Voltar ao painel
        </Link>
      </Button>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-titulo md:text-3xl">{analise.partes}</h1>
        <p className="text-sm text-texto-secundario">
          <span className="whitespace-nowrap tabular-nums">{analise.cnj}</span> · {analise.orgao}
        </p>
      </header>
      <BalaoLia className="text-sm">
        Li a intimação e separei o que importa. O prazo só vale depois que você confirmar.
      </BalaoLia>
      <Tabs value={aba} onValueChange={setAba}>
        <TabsList className="lg:hidden">
          <TabsTrigger value="analise">Análise</TabsTrigger>
          <TabsTrigger value="documento">Documento</TabsTrigger>
        </TabsList>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <TabsContent value="analise" forceMount className={`flex-col gap-4 ${conteudoAba}`}>
            <div className="flex flex-col gap-4">
              <section className="rounded-xl border bg-card p-4 shadow-xs">
                <h2 className="text-lg font-semibold">O que aconteceu</h2>
                <p className="mt-1 text-sm">{analise.resumo}</p>
              </section>
              {plano.recursosPro ? (
                <section className="rounded-xl border bg-card p-4 shadow-xs">
                  <h2 className="text-lg font-semibold">Pontos que podem ser atacados</h2>
                  <ul className="mt-2 flex flex-col gap-2 text-sm">
                    {analise.pontos.length === 0 && (
                      <li className="text-texto-secundario">
                        Não encontrei um ponto claro para atacar nesta decisão.
                      </li>
                    )}
                    {analise.pontos.map(({ titulo, explicacao, trechoId }) => (
                      <li
                        key={titulo}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <span className="flex min-w-0 flex-1 basis-48 gap-2">
                          <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-primaria" />
                          <span>
                            {titulo}
                            {explicacao && (
                              <span className="block text-xs text-texto-secundario">
                                {explicacao}
                              </span>
                            )}
                          </span>
                        </span>
                        {trechoId && (
                          <Button
                            variant="outline"
                            size="sm"
                            aria-pressed={destaque === trechoId}
                            onClick={() => verTrecho(trechoId)}
                          >
                            <Quote aria-hidden />
                            Ver trecho
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : (
                <AvisoPro
                  titulo="Pontos que podem ser atacados"
                  descricao={textoPontos(analise.pontos.length)}
                />
              )}
              <BlocoPrazo
                intimacaoId={analise.id}
                prazo={analise.prazo}
                motivoSemPrazo={analise.motivoSemPrazo}
                hoje={analise.hoje}
                regra={analise.regra}
                calendario={analise.calendario}
                recebimento={analise.recebimento}
                confirmado={confirmado}
                aoMudarConfirmacao={setConfirmado}
              />
              <EscolhaPeca
                pecas={plano.recursosPro ? analise.pecas : analise.pecas.slice(0, 1)}
                escolhida={pecaEscolhida}
                aoEscolher={setPecaEscolhida}
              />
              <section className="flex flex-col gap-2 rounded-xl bg-primaria-fundo p-4">
                {confirmado && restantes <= 0 ? (
                  <Button size="lg" onClick={() => setLimiteAberto(true)}>
                    Gerar rascunho no meu estilo
                  </Button>
                ) : confirmado ? (
                  <Button size="lg" onClick={gerar} disabled={gerando || !pecaEscolhida}>
                    {gerando ? "Preparando o rascunho..." : "Gerar rascunho no meu estilo"}
                  </Button>
                ) : (
                  <Button disabled size="lg">
                    Gerar rascunho no meu estilo
                  </Button>
                )}
                <p className="text-center text-sm">
                  {confirmado
                    ? `${restantes} de ${uso.limite} peças restantes neste mês`
                    : "Confirme o prazo para gerar o rascunho"}
                </p>
              </section>
            </div>
          </TabsContent>
          <TabsContent
            value="documento"
            forceMount
            className={`lg:sticky lg:top-16 lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto ${conteudoAba}`}
          >
            <DocumentoOriginal analise={analise} destaque={destaque} />
          </TabsContent>
        </div>
      </Tabs>
      <ModalLimite
        aberto={limiteAberto}
        bloqueio
        limite={uso.limite}
        pacote={plano.pacote}
        aoMudar={setLimiteAberto}
        aoComprar={() => {
          setLimiteAberto(false);
          toast.info("A cobrança ainda não está ligada. Nenhum valor foi cobrado.");
        }}
        aoMudarPlano={() => router.push("/app/plano")}
      />
    </div>
  );
}
