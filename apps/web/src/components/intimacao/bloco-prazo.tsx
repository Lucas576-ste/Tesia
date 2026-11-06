"use client";

import { CheckCircle2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Analise } from "@/lib/analises-exemplo";

function formatarData(iso: string) {
  return iso.split("-").reverse().join("/");
}

type BlocoPrazoProps = {
  prazo: Analise["prazo"];
  confirmado: boolean;
  aoMudarConfirmacao: (confirmado: boolean) => void;
};

export function BlocoPrazo({ prazo, confirmado, aoMudarConfirmacao }: BlocoPrazoProps) {
  const [data, setData] = useState(prazo.vencimentoIso);
  const [editando, setEditando] = useState(false);
  const [conferindo, setConferindo] = useState(false);
  const editada = data !== prazo.vencimentoIso;
  const depoisDaSugerida = data > prazo.vencimentoIso;

  function confirmar() {
    aoMudarConfirmacao(true);
    setEditando(false);
    setConferindo(false);
    toast.success(
      editada
        ? "Prazo confirmado. A data sugerida e a escolhida foram registradas."
        : "Prazo confirmado.",
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border-l-4 border-destaque bg-card p-4 shadow-xs">
      <h2 className="text-lg font-semibold">Prazo sugerido</h2>
      <div>
        <p className="font-serif text-3xl font-semibold tabular-nums">
          {data ? formatarData(data) : "Sem data"}
        </p>
        <p className="text-sm text-texto-secundario">
          {prazo.dias} dias {prazo.contagem} · {prazo.fundamento}
        </p>
        {editada && (
          <p className="text-sm text-texto-secundario tabular-nums">
            Data sugerida: {formatarData(prazo.vencimentoIso)}
          </p>
        )}
      </div>
      <details className="rounded-md border p-3 text-sm">
        <summary className="cursor-pointer font-medium">Ver a conta do prazo</summary>
        <ul className="mt-2 flex flex-col gap-1 text-texto-secundario">
          {prazo.memoria.map((linha) => (
            <li key={linha}>{linha}</li>
          ))}
        </ul>
      </details>
      {editando && !confirmado && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="data-prazo">Data do prazo</Label>
          <Input
            id="data-prazo"
            type="date"
            value={data}
            onChange={(evento) => setData(evento.target.value)}
          />
        </div>
      )}
      {depoisDaSugerida && (
        <p role="alert" className="flex gap-2 rounded-md bg-atencao-fundo p-2 text-sm text-atencao">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          Essa data é depois da sugerida. Confira a contagem antes de confirmar.
        </p>
      )}
      {confirmado ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p role="status" className="flex items-center gap-2 text-sm font-medium text-sucesso">
            <CheckCircle2 aria-hidden className="size-4" />
            Prazo confirmado por você
          </p>
          <Button variant="ghost" size="sm" onClick={() => aoMudarConfirmacao(false)}>
            Alterar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            disabled={!data}
            onClick={editada ? () => setConferindo(true) : confirmar}
            className="sm:flex-1"
          >
            Confirmo o prazo
          </Button>
          <Button variant="outline" onClick={() => setEditando((atual) => !atual)}>
            {editando ? "Fechar edição" : "Editar data"}
          </Button>
        </div>
      )}
      <Dialog open={conferindo} onOpenChange={setConferindo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar a data escolhida?</DialogTitle>
            <DialogDescription>
              A data sugerida e a escolhida ficam registradas. A responsabilidade pela data é sua.
            </DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-2 gap-3 text-sm tabular-nums">
            <div>
              <dt className="text-xs text-texto-secundario">Data sugerida</dt>
              <dd className="font-medium">{formatarData(prazo.vencimentoIso)}</dd>
            </div>
            <div>
              <dt className="text-xs text-texto-secundario">Data escolhida</dt>
              <dd className="font-medium">{formatarData(data)}</dd>
            </div>
          </dl>
          {depoisDaSugerida && (
            <p role="alert" className="rounded-md bg-atencao-fundo p-2 text-sm text-atencao">
              Essa data é depois da sugerida. Confira a contagem antes de confirmar.
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Voltar</Button>
            </DialogClose>
            <Button onClick={confirmar}>Confirmar data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
