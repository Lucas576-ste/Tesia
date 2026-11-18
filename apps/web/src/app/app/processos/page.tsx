import type { Metadata } from "next";
import { ListaProcessos } from "@/components/processo/lista-processos";
import { listarProcessos } from "@/lib/processos";

export const metadata: Metadata = { title: "Processos · Tesia" };

type ProcessosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProcessosPage({ searchParams }: ProcessosPageProps) {
  const { novo } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-titulo">Processos</h1>
        <p className="text-sm text-texto-secundario">
          A lista é criada a partir das intimações que você envia.
        </p>
      </header>
      <ListaProcessos processosIniciais={await listarProcessos()} novoProcesso={novo === "1"} />
    </div>
  );
}
