import type { Metadata } from "next";
import { TelaPlano } from "@/components/plano/tela-plano";
import { Badge } from "@/components/ui/badge";
import { exemploPlanoSchema } from "@/lib/conta-exemplo";

export const metadata: Metadata = { title: "Plano e uso · Tesia" };

type PlanoPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PlanoPage({ searchParams }: PlanoPageProps) {
  const { exemplo } = await searchParams;
  const exemploInicial = exemploPlanoSchema.parse(exemplo ?? null);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-3xl font-semibold text-titulo">Plano e uso</h1>
        <Badge variant="secondary">Dados de exemplo</Badge>
      </header>
      <TelaPlano key={exemploInicial ?? "padrao"} exemploInicial={exemploInicial} />
    </div>
  );
}
