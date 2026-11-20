"use client";

import { ArrowLeft, CalendarPlus, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { editarProcesso } from "@/app/app/processos/acoes";
import { faseDoProcesso } from "@tesia/shared";
import { AcoesFase } from "@/components/clientes/acoes-fase";
import { BarraFases } from "@/components/clientes/barra-fases";
import { EscolherCliente } from "@/components/clientes/escolher-cliente";
import { SeloStatus } from "@/components/selo-status";
import { PrazoInterno } from "@/components/tabela-prazos";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dadosProcessoSchema, type DadosProcesso, type Processo } from "@/lib/processo-tipos";
import { FormularioProcesso } from "./formulario-processo";
import { LinhaTempo } from "./linha-tempo";

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-xs text-texto-secundario">{rotulo}</dt>
      <dd className="text-sm break-words tabular-nums">{valor}</dd>
    </div>
  );
}

export function TelaProcesso({
  processo,
  clientes,
}: {
  processo: Processo;
  clientes: { id: string; nome: string }[];
}) {
  const proximoPasso = processo.encerrado
    ? null
    : faseDoProcesso(processo.rito, processo.fase)?.proximo;
  const [dados, setDados] = useState<DadosProcesso>({
    cnj: processo.cnj,
    partes: processo.partes,
    area: dadosProcessoSchema.shape.area.safeParse(processo.area).data ?? "Cível e consumidor",
    tribunal: processo.tribunal,
    vara: processo.vara,
  });
  const [editando, setEditando] = useState(false);

  async function salvar(novos: DadosProcesso) {
    const resultado = await editarProcesso(processo.id, novos);
    if ("erro" in resultado) {
      toast.error(resultado.erro);
      return;
    }
    setDados(novos);
    setEditando(false);
    toast.success("Dados do processo atualizados.");
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link
          href={
            processo.cliente
              ? `/app/clientes/${processo.cliente.id}`
              : "/app/clientes?aba=processos"
          }
        >
          <ArrowLeft aria-hidden />
          {processo.cliente ? `Voltar a ${processo.cliente.nome}` : "Voltar aos processos"}
        </Link>
      </Button>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold text-titulo md:text-3xl">{dados.partes}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <SeloStatus status={processo.status} />
            <span className="tabular-nums">
              {processo.proximoPrazo
                ? `Próximo prazo fatal: ${processo.proximoPrazo}`
                : "Sem prazo em aberto"}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/app/prazos?novo=prazo&processo=${processo.id}`}>
              <CalendarPlus aria-hidden />
              Novo prazo
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/app/intimacoes/nova?processo=${processo.id}`}>
              <Plus aria-hidden />
              Nova intimação neste processo
            </Link>
          </Button>
        </div>
      </header>
      <Card className="gap-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-texto-secundario">Cliente</span>
            {processo.cliente ? (
              <Link
                href={`/app/clientes/${processo.cliente.id}`}
                className="text-lg font-semibold text-primaria underline-offset-2 hover:underline"
              >
                {processo.cliente.nome}
              </Link>
            ) : (
              <span className="text-lg font-semibold text-atencao">Sem cliente definido</span>
            )}
          </div>
          <EscolherCliente
            processoId={processo.id}
            clienteAtual={processo.cliente?.id ?? null}
            clientes={clientes}
            rotulo={processo.cliente ? "Trocar cliente" : "Escolher cliente"}
          />
        </div>
        <BarraFases rito={processo.rito} fase={processo.fase} encerrado={processo.encerrado} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{processo.nomeFase}</span>
            <span className="text-xs text-texto-secundario">{processo.origemFase}</span>
            {proximoPasso && (
              <p className="mt-1 text-sm">
                <span className="font-medium">Próximo passo provável: </span>
                {proximoPasso}
              </p>
            )}
          </div>
          <AcoesFase
            processoId={processo.id}
            rito={processo.rito}
            fase={processo.fase}
            encerrado={processo.encerrado}
          />
        </div>
      </Card>
      <Card className="gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Dados do processo</h2>
          <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
            <Pencil aria-hidden />
            Editar
          </Button>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Dado rotulo="Número" valor={dados.cnj} />
          <Dado rotulo="Partes" valor={dados.partes} />
          <Dado rotulo="Área" valor={dados.area} />
          <Dado rotulo="Tribunal" valor={dados.tribunal} />
          <Dado rotulo="Vara" valor={dados.vara} />
        </dl>
      </Card>
      {processo.prazos.length > 0 && (
        <Card className="gap-3 p-4">
          <h2 className="text-lg font-semibold">Datas dos prazos</h2>
          <ul className="flex flex-col gap-4">
            {processo.prazos.map((prazo) => (
              <li key={prazo.id} className="flex flex-col gap-2">
                <p className="text-sm font-medium">{prazo.peca}</p>
                <dl className="grid gap-3 sm:grid-cols-3">
                  <Dado rotulo="Início da contagem" valor={prazo.inicio ?? "—"} />
                  <div className="flex min-w-0 flex-col">
                    <dt className="text-xs text-texto-secundario">Prazo interno</dt>
                    <dd className="text-sm">
                      <PrazoInterno prazo={prazo} />
                    </dd>
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <dt className="text-xs text-texto-secundario">Prazo fatal</dt>
                    <dd className="text-sm font-semibold tabular-nums">{prazo.vencimento}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Card className="gap-3 p-4">
        <h2 className="text-lg font-semibold">Linha do tempo</h2>
        <LinhaTempo eventos={processo.eventos} />
      </Card>
      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar dados do processo</DialogTitle>
            <DialogDescription>Confira os dados antes de salvar.</DialogDescription>
          </DialogHeader>
          <FormularioProcesso dados={dados} aoSalvar={salvar} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
