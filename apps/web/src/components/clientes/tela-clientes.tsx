"use client";

import { ETAPAS, type CodigoEtapa } from "@tesia/shared";
import { Search, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { criarCliente } from "@/app/app/clientes/acoes";
import { EstadoVazio } from "@/components/estado-vazio";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ClienteResumo, ProcessoAcompanhado } from "@/lib/clientes";
import type { Processo } from "@/lib/processo-tipos";
import { ListaProcessos } from "@/components/processo/lista-processos";
import { cn } from "@/lib/utils";
import { CardProcesso } from "./card-processo";
import { FormularioCliente } from "./formulario-cliente";

type TelaClientesProps = {
  clientes: ClienteResumo[];
  processos: ProcessoAcompanhado[];
  semCliente: ProcessoAcompanhado[];
  listaProcessos: Processo[];
  abaInicial: "cliente" | "fase" | "processos";
  novoProcesso: boolean;
};

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function resumoEtapas(processos: ProcessoAcompanhado[]) {
  const contagem = new Map<string, number>();
  for (const processo of processos)
    contagem.set(processo.nomeFase, (contagem.get(processo.nomeFase) ?? 0) + 1);
  return [...contagem.entries()];
}

function ListaPorCliente({ clientes }: { clientes: ClienteResumo[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {clientes.map((cliente) => {
        const proximo = cliente.processos
          .map((processo) => processo.proximoPrazo)
          .filter(Boolean)[0];
        const parados = cliente.processos.filter((processo) => processo.diasParado).length;
        return (
          <li key={cliente.id}>
            <Link
              href={`/app/clientes/${cliente.id}`}
              className="flex h-full flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary hover:shadow-md focus-visible:border-primary focus-visible:outline-none"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-titulo">{cliente.nome}</span>
                <span className="text-xs text-texto-secundario">
                  {cliente.processos.length === 1
                    ? "1 processo"
                    : `${cliente.processos.length} processos`}
                </span>
              </span>
              <span className="flex flex-wrap gap-1.5">
                {resumoEtapas(cliente.processos).map(([fase, quantidade]) => (
                  <span
                    key={fase}
                    className="rounded-full bg-primaria-fundo px-2 py-0.5 text-xs font-medium text-primaria"
                  >
                    {quantidade > 1 ? `${quantidade} em ` : ""}
                    {fase}
                  </span>
                ))}
              </span>
              <span className="flex flex-wrap gap-x-4 text-xs text-texto-secundario">
                {proximo && (
                  <span>
                    Próximo prazo: <strong className="text-texto tabular-nums">{proximo}</strong>
                  </span>
                )}
                {parados > 0 && (
                  <span className="text-atencao">{parados} parado(s) há mais de 60 dias</span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
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
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(false);
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

  async function salvarNovo(dados: Parameters<typeof criarCliente>[0]) {
    const resultado = await criarCliente(dados);
    if ("erro" in resultado) {
      toast.error(resultado.erro);
      return false;
    }
    toast.success("Cliente cadastrado.");
    setNovo(false);
    router.push(`/app/clientes/${resultado.id}`);
    return true;
  }

  if (clientes.length === 0 && processos.length === 0 && !novoProcesso) {
    return (
      <EstadoVazio
        titulo="Seus clientes aparecem aqui"
        descricao="Conforme as intimações chegam, eu identifico o cliente de cada processo e acompanho a fase até o fim."
        acao={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
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
        <div className="relative sm:w-80">
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
        <Button onClick={() => setNovo(true)}>
          <UserPlus aria-hidden />
          Novo cliente
        </Button>
      </div>
      {semCliente.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-atencao/40 bg-atencao-fundo p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-atencao">
            <Users aria-hidden className="size-4" />
            {semCliente.length === 1
              ? "1 processo sem cliente definido"
              : `${semCliente.length} processos sem cliente definido`}
          </p>
          <ul className="flex flex-wrap gap-2">
            {semCliente.map((processo) => (
              <li key={processo.id}>
                <Link
                  href={`/app/processos/${processo.id}`}
                  className="rounded-md bg-card px-2 py-1 text-xs underline-offset-2 hover:underline"
                >
                  {processo.partes} · {processo.cnj}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Tabs value={aba} onValueChange={trocarAba}>
        <TabsList>
          <TabsTrigger value="cliente">Por cliente</TabsTrigger>
          <TabsTrigger value="fase">Por fase</TabsTrigger>
          <TabsTrigger value="processos">Todos os processos</TabsTrigger>
        </TabsList>
        <TabsContent value="cliente" className="pt-2">
          {clientesVisiveis.length ? (
            <ListaPorCliente clientes={clientesVisiveis} />
          ) : (
            <p className="text-sm text-texto-secundario">Nenhum cliente encontrado.</p>
          )}
        </TabsContent>
        <TabsContent value="fase" className="pt-2">
          <QuadroFases processos={processosVisiveis} />
        </TabsContent>
        <TabsContent value="processos" className="pt-2">
          <ListaProcessos processosIniciais={listaProcessos} novoProcesso={novoProcesso} />
        </TabsContent>
      </Tabs>
      <Dialog open={novo} onOpenChange={setNovo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
            <DialogDescription>
              Depois, ligue os processos dele pela página de cada processo.
            </DialogDescription>
          </DialogHeader>
          <FormularioCliente inicial={{ nome: "" }} aoSalvar={salvarNovo} rotulo="Cadastrar" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
