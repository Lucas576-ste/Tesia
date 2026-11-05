"use client";

import { ArrowLeft, Quote, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usoExemplo } from "@/components/layout/dados-exemplo";
import { BalaoLia } from "@/components/lia/balao-lia";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Analise } from "@/lib/analises-exemplo";
import { BlocoPrazo } from "./bloco-prazo";
import { DocumentoOriginal } from "./documento-original";
import { EscolhaPeca } from "./escolha-peca";

const conteudoAba = "data-[state=inactive]:hidden lg:data-[state=inactive]:block";

export function TelaAnalise({ analise }: { analise: Analise }) {
  const [aba, setAba] = useState("analise");
  const [destaque, setDestaque] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const restantes = usoExemplo.limite - usoExemplo.usadas;

  useEffect(() => {
    if (!destaque) return;
    document
      .getElementById(`trecho-${destaque}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [destaque, aba]);

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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold text-titulo md:text-3xl">{analise.partes}</h1>
          <Badge variant="secondary">Dados de exemplo</Badge>
        </div>
        <p className="text-sm text-texto-secundario">
          <span className="tabular-nums">{analise.cnj}</span> · {analise.orgao}
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
              <section className="rounded-xl border bg-card p-4 shadow-xs">
                <h2 className="text-lg font-semibold">Pontos que podem ser atacados</h2>
                <ul className="mt-2 flex flex-col gap-2 text-sm">
                  {analise.pontos.map(({ titulo, trechoId }) => (
                    <li
                      key={trechoId}
                      className="flex flex-wrap items-center justify-between gap-2"
                    >
                      <span className="flex min-w-0 flex-1 basis-48 gap-2">
                        <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-primaria" />
                        {titulo}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-pressed={destaque === trechoId}
                        onClick={() => verTrecho(trechoId)}
                      >
                        <Quote aria-hidden />
                        Ver trecho
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
              <BlocoPrazo
                prazo={analise.prazo}
                confirmado={confirmado}
                aoMudarConfirmacao={setConfirmado}
              />
              <EscolhaPeca pecas={analise.pecas} />
              <section className="flex flex-col gap-2 rounded-xl bg-primaria-fundo p-4">
                {confirmado ? (
                  <Button asChild size="lg">
                    <Link href={`/app/pecas/${analise.id}`}>Gerar rascunho no meu estilo</Link>
                  </Button>
                ) : (
                  <Button disabled size="lg">
                    Gerar rascunho no meu estilo
                  </Button>
                )}
                <p className="text-center text-sm">
                  {confirmado
                    ? `${restantes} de ${usoExemplo.limite} peças restantes neste mês`
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
    </div>
  );
}
