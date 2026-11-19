import type { Metadata } from "next";
import { TelaPlano } from "@/components/plano/tela-plano";
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
      <h1 className="text-3xl font-semibold text-titulo">Plano e uso</h1>
      <TelaPlano key={exemploInicial ?? "padrao"} exemploInicial={exemploInicial} />
    </div>
  );
}
