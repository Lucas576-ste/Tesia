"use client";

import { ArrowLeft, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { SeloStatus } from "@/components/selo-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DadosProcesso, Processo } from "@/lib/processos-exemplo";
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

export function TelaProcesso({ processo }: { processo: Processo }) {
  const [dados, setDados] = useState<DadosProcesso>({
    cnj: processo.cnj,
    partes: processo.partes,
    area: processo.area,
    tribunal: processo.tribunal,
    vara: processo.vara,
  });
  const [editando, setEditando] = useState(false);

  function salvar(novos: DadosProcesso) {
    setDados(novos);
    setEditando(false);
    toast.success("Dados atualizados nesta tela.");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/app/processos">
          <ArrowLeft aria-hidden />
          Voltar aos processos
        </Link>
      </Button>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold text-titulo md:text-3xl">{dados.partes}</h1>
            <Badge variant="secondary">Dados de exemplo</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <SeloStatus status={processo.status} />
            <span className="tabular-nums">
              {processo.proximoPrazo
                ? `Próximo prazo: ${processo.proximoPrazo}`
                : "Sem prazo em aberto"}
            </span>
          </div>
        </div>
        <Button asChild className="shrink-0">
          <Link href={`/app/intimacoes/nova?processo=${processo.id}`}>
            <Plus aria-hidden />
            Nova intimação neste processo
          </Link>
        </Button>
      </header>
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
        <p className="text-xs text-texto-secundario">Demonstração: as edições não são salvas.</p>
      </Card>
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
