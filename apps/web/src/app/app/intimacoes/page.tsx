import type { Metadata } from "next";
import Link from "next/link";
import { BannerSincronizacaoIntimacoes } from "@/components/intimacao/banner-sincronizacao";
import { PainelFiltrosIntimacoes } from "@/components/intimacao/filtros-intimacoes";
import { ListaIntimacoes } from "@/components/intimacao/lista-intimacoes";
import { Button } from "@/components/ui/button";
import {
  contarFiltrosAtivos,
  filtrosIntimacoesDaUrl,
  SEM_FILTROS,
  urlDasIntimacoes,
} from "@/lib/intimacoes-lista";
import {
  bannerSincronizacao,
  listarIntimacoesPagina,
  opcoesDeFiltro,
} from "@/lib/intimacoes-lista-servidor";
import { resumoIntimacoes } from "@/lib/intimacoes";
import { listarResponsaveis } from "@/lib/termos-servidor";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Intimações · Tesia" };

type IntimacoesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function IntimacoesPage({ searchParams }: IntimacoesPageProps) {
  const filtros = filtrosIntimacoesDaUrl(await searchParams);
  const [pagina, banner, opcoes, responsaveis, resumo] = await Promise.all([
    listarIntimacoesPagina(filtros),
    bannerSincronizacao(),
    opcoesDeFiltro(),
    listarResponsaveis(),
    resumoIntimacoes(),
  ]);
  const abas = [
    {
      href: urlDasIntimacoes({ ...filtros, ...SEM_FILTROS }),
      rotulo: "Todas",
      ativa: !filtros.aguardando,
    },
    {
      href: urlDasIntimacoes({ ...SEM_FILTROS, aguardando: true }),
      rotulo: `Aguardando confirmação${resumo.pendentes ? ` (${resumo.pendentes})` : ""}`,
      ativa: filtros.aguardando,
    },
  ];
  const comFiltros = contarFiltrosAtivos(filtros) > 0 || filtros.busca !== "" || filtros.aguardando;

  return (
    <div className="flex w-full flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-titulo">Intimações</h1>
          <p className="text-sm text-texto-secundario">
            O que chegou: enviado por você ou encontrado nos diários, com a situação de cada uma.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/intimacoes/nova">Enviar intimação</Link>
        </Button>
      </header>
      <BannerSincronizacaoIntimacoes banner={banner} />
      <nav aria-label="Atalhos das intimações" className="flex flex-wrap gap-1">
        {abas.map(({ href, rotulo, ativa }) => (
          <Link
            key={href}
            href={href}
            aria-current={ativa ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              ativa
                ? "bg-secondary text-secondary-foreground"
                : "text-texto-secundario hover:bg-muted",
            )}
          >
            {rotulo}
          </Link>
        ))}
      </nav>
      <PainelFiltrosIntimacoes filtros={filtros} opcoes={opcoes} />
      <ListaIntimacoes
        pagina={pagina}
        filtros={filtros}
        responsaveis={responsaveis}
        comFiltros={comFiltros}
      />
    </div>
  );
}
