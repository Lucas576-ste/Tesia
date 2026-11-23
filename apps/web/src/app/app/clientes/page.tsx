import type { Metadata } from "next";
import { z } from "zod";
import { TelaClientes } from "@/components/clientes/tela-clientes";
import { listarAcompanhamento } from "@/lib/clientes";
import { filtrosDaUrl } from "@/lib/clientes-lista";
import { listarClientesPaginado } from "@/lib/clientes-lista-servidor";
import { buscarMetricasClientes } from "@/lib/clientes-metricas-servidor";
import { listarProcessos } from "@/lib/processos";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Clientes · Tesia" };

type ClientesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function clienteDaUrl(valor: string | string[] | undefined) {
  if (typeof valor !== "string" || !z.uuid().safeParse(valor).success) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("clientes")
    .select("id, nome")
    .eq("id", valor)
    .is("excluido_em", null)
    .maybeSingle();
  return z.object({ id: z.uuid(), nome: z.string() }).safeParse(data).data ?? null;
}

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const parametros = await searchParams;
  const { aba, novo, cliente } = parametros;
  const filtros = filtrosDaUrl(parametros);
  const [
    { clientes, processos, semCliente },
    listaProcessos,
    paginaClientes,
    metricas,
    clienteInicial,
  ] = await Promise.all([
    listarAcompanhamento(),
    listarProcessos(),
    listarClientesPaginado(filtros),
    buscarMetricasClientes(),
    novo === "1" ? clienteDaUrl(cliente) : Promise.resolve(null),
  ]);
  return (
    <div className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-titulo">Clientes</h1>
        <p className="text-sm text-texto-secundario">
          Cada cliente com os seus processos e a fase de cada um, do início ao fim.
        </p>
      </header>
      <TelaClientes
        key={`${aba ?? ""}|${novo ?? ""}|${clienteInicial?.id ?? ""}`}
        clientes={clientes}
        processos={processos}
        semCliente={semCliente}
        listaProcessos={listaProcessos}
        abaInicial={aba === "fase" || aba === "processos" ? aba : "cliente"}
        novoProcesso={novo === "1"}
        clienteInicial={clienteInicial}
        paginaClientes={paginaClientes}
        filtrosLista={filtros}
        metricas={metricas}
      />
    </div>
  );
}
