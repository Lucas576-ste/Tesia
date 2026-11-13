import type { Metadata } from "next";
import Link from "next/link";
import { ListaIntimacoes } from "@/components/intimacao/lista-intimacoes";
import { Button } from "@/components/ui/button";
import { listarIntimacoes } from "@/lib/intimacoes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Intimações · Tesia" };

type IntimacoesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function IntimacoesPage({ searchParams }: IntimacoesPageProps) {
  const { filtro } = await searchParams;
  const soPendentes = filtro === "aguardando";
  const itens = await listarIntimacoes();
  const pendentes = itens.filter(({ situacao }) => situacao === "aguardando").length;
  const abas = [
    { href: "/app/intimacoes", rotulo: "Todas", ativa: !soPendentes },
    {
      href: "/app/intimacoes?filtro=aguardando",
      rotulo: `Aguardando confirmação${pendentes ? ` (${pendentes})` : ""}`,
      ativa: soPendentes,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-titulo">Intimações</h1>
          <p className="text-sm text-texto-secundario">
            Tudo o que você enviou, com a situação de cada análise.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/intimacoes/nova">Nova intimação</Link>
        </Button>
      </header>
      <nav aria-label="Filtro das intimações" className="flex flex-wrap gap-1">
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
      <ListaIntimacoes itens={itens} soPendentes={soPendentes} />
    </div>
  );
}
