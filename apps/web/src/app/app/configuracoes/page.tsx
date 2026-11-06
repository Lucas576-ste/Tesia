import type { Metadata } from "next";
import { TelaConfiguracoes } from "@/components/configuracoes/tela-configuracoes";
import { Badge } from "@/components/ui/badge";
import { abaConfiguracoesSchema } from "@/lib/conta-exemplo";

export const metadata: Metadata = { title: "Configurações · Tesia" };

type ConfiguracoesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConfiguracoesPage({ searchParams }: ConfiguracoesPageProps) {
  const { aba } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 className="text-3xl font-semibold text-titulo">Configurações</h1>
        <Badge variant="secondary">Dados de exemplo</Badge>
      </header>
      <TelaConfiguracoes abaInicial={abaConfiguracoesSchema.parse(aba)} />
    </div>
  );
}
