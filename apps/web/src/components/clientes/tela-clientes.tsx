"use client";

import { ETAPAS, tituloNome, type CodigoEtapa } from "@tesia/shared";
import { LayoutGrid, List, Search, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AvisoInfo } from "@/components/aviso-info";
import { EstadoVazio } from "@/components/estado-vazio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ClienteResumo, ProcessoAcompanhado } from "@/lib/clientes";
import type { FiltrosLista, PaginaClientes } from "@/lib/clientes-lista";
import type { Processo } from "@/lib/processo-tipos";
import { ListaProcessos } from "@/components/processo/lista-processos";
import { cn } from "@/lib/utils";
import { resumoCliente } from "@/lib/resumo-cliente";
import { CardCliente } from "./card-cliente";
import { CardProcesso } from "./card-processo";
import { EscolherCliente } from "./escolher-cliente";
import type { MetricasClientes } from "@/lib/clientes-metricas";
import { ListaClientes } from "./lista-clientes";
import { useDrawerCliente } from "./provedor-cliente";
import { useExibicaoClientes } from "./usar-exibicao-clientes";

type TelaClientesProps = {
  clientes: ClienteResumo[];
  processos: ProcessoAcompanhado[];
  semCliente: ProcessoAcompanhado[];
  listaProcessos: Processo[];
  abaInicial: "cliente" | "fase" | "processos";
  novoProcesso: boolean;
  clienteInicial: { id: string; nome: string } | null;
  paginaClientes: PaginaClientes;
  filtrosLista: FiltrosLista;
  metricas: MetricasClientes | null;
};

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

type FiltroRapido = "semana" | "sem-contato";

const FILTROS_RAPIDOS: { id: FiltroRapido; rotulo: string }[] = [
  { id: "semana", rotulo: "Com prazo esta semana" },
  { id: "sem-contato", rotulo: "Sem contato há 30 dias" },
];

function passaNoFiltro(cliente: ClienteResumo, filtro: FiltroRapido | null) {
  if (!filtro) return true;
  const resumo = resumoCliente(cliente);
  if (filtro === "sem-contato") return resumo.diasContato === null || resumo.diasContato >= 30;
  if (!resumo.proximo) return false;
  return resumo.proximo.diasAtraso > 0 || resumo.proximo.diasUteis <= 5;
}

function PorCliente({
  clientes,
  pagina,
  filtros,
  metricas,
}: {
  clientes: ClienteResumo[];
  pagina: PaginaClientes;
  filtros: FiltrosLista;
  metricas: MetricasClientes | null;
}) {
  const [exibicao, trocar] = useExibicaoClientes();
  const [filtro, setFiltro] = useState<FiltroRapido | null>(null);
  const visiveis = clientes.filter((cliente) => passaNoFiltro(cliente, filtro));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Filtros rápidos"
          className={cn("flex flex-wrap gap-1.5", exibicao === "lista" && "hidden")}
        >
          {FILTROS_RAPIDOS.map(({ id, rotulo }) => (
            <button
              key={id}
              type="button"
              aria-pressed={filtro === id}
              onClick={() => setFiltro(filtro === id ? null : id)}
              className={cn(
                "h-7 rounded-full border px-3 text-xs font-medium",
                filtro === id
                  ? "border-primary bg-primaria-fundo text-primaria"
                  : "bg-card text-texto-secundario hover:text-texto",
              )}
            >
              {rotulo}
            </button>
          ))}
        </div>
        <div
          role="group"
          aria-label="Exibição"
          className="ml-auto flex rounded-lg border bg-card p-0.5"
        >
          {(
            [
              ["cards", LayoutGrid, "Cards"],
              ["lista", List, "Lista"],
            ] as const
          ).map(([valor, Icone, rotulo]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={exibicao === valor}
              onClick={() => trocar(valor)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-texto-secundario",
                exibicao === valor && "bg-primaria-fundo text-primaria",
              )}
            >
              <Icone aria-hidden className="size-3.5" />
              {rotulo}
            </button>
          ))}
        </div>
      </div>
      {exibicao === "lista" ? (
        <ListaClientes pagina={pagina} filtros={filtros} metricas={metricas} />
      ) : visiveis.length === 0 ? (
        <p className="text-sm text-texto-secundario">Nenhum cliente encontrado.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((cliente) => (
            <CardCliente key={cliente.id} cliente={cliente} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ProcessosSemCliente({
  processos,
  clientes,
}: {
  processos: ProcessoAcompanhado[];
  clientes: { id: string; nome: string }[];
}) {
  return (
    <AvisoInfo
      icone={Users}
      titulo={
        processos.length === 1
          ? "1 processo sem cliente definido"
          : `${processos.length} processos sem cliente definido`
      }
    >
      <ul className="flex flex-col divide-y rounded-lg border bg-card">
        {processos.map((processo) => (
          <li
            key={processo.id}
            className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <Link href={`/app/processos/${processo.id}`} className="min-w-0 hover:underline">
              <span className="block truncate text-sm font-medium">
                {processo.partes
                  .split(/\s+x\s+/i)
                  .map(tituloNome)
                  .join(" x ")}
              </span>
              <span className="block font-mono text-xs text-texto-secundario">{processo.cnj}</span>
            </Link>
            <EscolherCliente
              processoId={processo.id}
              clienteAtual={null}
              clientes={clientes}
              rotulo="Vincular cliente"
            />
          </li>
        ))}
      </ul>
    </AvisoInfo>
  );
}

function QuadroFases({ processos }: { processos: ProcessoAcompanhado[] }) {
  const [etapaCelular, setEtapaCelular] = useState<CodigoEtapa>("inicio");
  const porEtapa = (codigo: CodigoEtapa) =>
    processos.filter((processo) => processo.etapa === codigo);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
        {ETAPAS.map(({ codigo, nome }) => (
          <button
            key={codigo}
            type="button"
            onClick={() => setEtapaCelular(codigo)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-sm",
              etapaCelular === codigo
                ? "border-primary bg-primaria-fundo font-semibold text-primaria"
                : "bg-card",
            )}
          >
            {nome} ({porEtapa(codigo).length})
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {porEtapa(etapaCelular).map((processo) => (
          <CardProcesso key={processo.id} processo={processo} mostrarCliente />
        ))}
        {porEtapa(etapaCelular).length === 0 && (
          <p className="text-sm text-texto-secundario">Nenhum processo nesta etapa.</p>
        )}
      </div>
      <div className="hidden gap-3 md:grid md:grid-cols-3 xl:grid-cols-6">
        {ETAPAS.map(({ codigo, nome }) => (
          <section
            key={codigo}
            aria-label={nome}
            className="flex min-w-0 flex-col gap-2 rounded-xl bg-muted/60 p-2"
          >
            <h2 className="flex items-center justify-between px-1 text-sm font-semibold">
              {nome}
              <span className="rounded-full bg-card px-2 text-xs font-medium text-texto-secundario">
                {porEtapa(codigo).length}
              </span>
            </h2>
            {porEtapa(codigo).map((processo) => (
              <CardProcesso key={processo.id} processo={processo} mostrarCliente />
            ))}
          </section>
        ))}
      </div>
    </>
  );
}

export function TelaClientes({
  clientes,
  processos,
  semCliente,
  listaProcessos,
  abaInicial,
  novoProcesso,
  clienteInicial,
  paginaClientes,
  filtrosLista,
  metricas,
}: TelaClientesProps) {
  const [aba, setAba] = useState<string>(abaInicial);

  function trocarAba(valor: string) {
    setAba(valor);
    window.history.replaceState(
      null,
      "",
      `/app/clientes${valor === "cliente" ? "" : `?aba=${valor}`}`,
    );
  }
  const { abrirNovo } = useDrawerCliente();
  const [exibicao] = useExibicaoClientes();
  const [busca, setBusca] = useState("");
  const termo = normalizar(busca.trim());
  const clientesVisiveis = clientes.filter(
    (cliente) =>
      !termo ||
      normalizar(cliente.nome).includes(termo) ||
      cliente.processos.some((processo) =>
        normalizar(`${processo.cnj} ${processo.partes}`).includes(termo),
      ),
  );
  const processosVisiveis = processos.filter(
    (processo) =>
      !termo ||
      normalizar(`${processo.clienteNome ?? ""} ${processo.cnj} ${processo.partes}`).includes(
        termo,
      ),
  );

  if (clientes.length === 0 && processos.length === 0 && !novoProcesso) {
    return (
      <EstadoVazio
        titulo="Seus clientes aparecem aqui"
        descricao="Conforme as intimações chegam, eu identifico o cliente de cada processo e acompanho a fase até o fim."
        acao={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={abrirNovo}>
              <UserPlus aria-hidden />
              Cadastrar cliente
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/intimacoes/nova">Enviar intimação</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/configuracoes?aba=alertas">Ligar a busca no DJEN</Link>
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          className={cn("relative sm:w-80", aba === "cliente" && exibicao === "lista" && "hidden")}
        >
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-texto-secundario"
          />
          <Input
            type="search"
            aria-label="Buscar cliente, parte ou número"
            placeholder="Buscar cliente, parte ou número"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={abrirNovo} className="sm:ml-auto">
          <UserPlus aria-hidden />
          Novo cliente
        </Button>
      </div>
      {semCliente.length > 0 && (
        <ProcessosSemCliente
          processos={semCliente}
          clientes={clientes.map(({ id, nome }) => ({ id, nome: tituloNome(nome) }))}
        />
      )}
      <Tabs value={aba} onValueChange={trocarAba}>
        <TabsList>
          <TabsTrigger value="cliente">Por cliente</TabsTrigger>
          <TabsTrigger value="fase">Por fase</TabsTrigger>
          <TabsTrigger value="processos">Todos os processos</TabsTrigger>
        </TabsList>
        <TabsContent value="cliente" className="pt-2">
          <PorCliente
            clientes={clientesVisiveis}
            pagina={paginaClientes}
            filtros={filtrosLista}
            metricas={metricas}
          />
        </TabsContent>
        <TabsContent value="fase" className="pt-2">
          <QuadroFases processos={processosVisiveis} />
        </TabsContent>
        <TabsContent value="processos" className="pt-2">
          <ListaProcessos
            processosIniciais={listaProcessos}
            novoProcesso={novoProcesso}
            clienteInicial={clienteInicial}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
