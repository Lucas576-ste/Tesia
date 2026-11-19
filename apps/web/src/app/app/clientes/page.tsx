import type { Metadata } from "next";
import { TelaClientes } from "@/components/clientes/tela-clientes";
import { listarAcompanhamento } from "@/lib/clientes";
import { listarProcessos } from "@/lib/processos";

export const metadata: Metadata = { title: "Clientes · Tesia" };

type ClientesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const { aba, novo } = await searchParams;
  const [{ clientes, processos, semCliente }, listaProcessos] = await Promise.all([
    listarAcompanhamento(),
    listarProcessos(),
  ]);
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-titulo">Clientes</h1>
        <p className="text-sm text-texto-secundario">
          Cada cliente com os seus processos e a fase de cada um, do início ao fim.
        </p>
      </header>
      <TelaClientes
        clientes={clientes}
        processos={processos}
        semCliente={semCliente}
        listaProcessos={listaProcessos}
        abaInicial={aba === "fase" || aba === "processos" ? aba : "cliente"}
        novoProcesso={novo === "1"}
      />
    </div>
  );
}
