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
import {
  calcularPrazoInterno,
  DIAS_PRAZO_INTERNO,
  isoParaData as formatarData,
  prazoInternoSchema,
} from "@/lib/prazo-interno";

type BlocoPrazoProps = {
  prazo: Analise["prazo"];
  confirmado: boolean;
  aoMudarConfirmacao: (confirmado: boolean) => void;
};

export function BlocoPrazo({ prazo, confirmado, aoMudarConfirmacao }: BlocoPrazoProps) {
  const [data, setData] = useState(prazo.vencimentoIso);
  const [editando, setEditando] = useState(false);
  const [conferindo, setConferindo] = useState(false);
  const [internoEscolhido, setInternoEscolhido] = useState<string | null>(null);
  const interno = internoEscolhido ?? (data ? calcularPrazoInterno(data) : "");
  const erroInterno = data
    ? prazoInternoSchema(data).safeParse(interno).error?.issues[0]?.message
    : undefined;
  const editada = data !== prazo.vencimentoIso;
  const depoisDaSugerida = data > prazo.vencimentoIso;

  function mudarFatal(novaData: string) {
    setData(novaData);
    if (internoEscolhido && novaData && internoEscolhido > novaData) setInternoEscolhido(null);
  }

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
        <p className="text-xs text-texto-secundario">Prazo fatal</p>
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
      <dl className="grid grid-cols-2 gap-3 text-sm tabular-nums">
        <div>
          <dt className="text-xs text-texto-secundario">Início da contagem</dt>
          <dd>{formatarData(prazo.inicioIso)}</dd>
        </div>
        <div>
          <dt className="text-xs text-texto-secundario">Prazo interno</dt>
          <dd>{interno ? formatarData(interno) : "Sem data"}</dd>
        </div>
      </dl>
      <p className="text-xs text-texto-secundario">
        O prazo interno é a sua data de organização, sem efeito legal.
        {internoEscolhido === null &&
          ` Por padrão, fica ${DIAS_PRAZO_INTERNO} dias úteis antes do fatal.`}
      </p>
      <details className="rounded-md border p-3 text-sm">
        <summary className="cursor-pointer font-medium">Ver a conta do prazo</summary>
        <ul className="mt-2 flex flex-col gap-1 text-texto-secundario">
          {prazo.memoria.map((linha) => (
            <li key={linha}>{linha}</li>
          ))}
        </ul>
      </details>
      {editando && !confirmado && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data-prazo">Prazo fatal</Label>
            <Input
              id="data-prazo"
              type="date"
              value={data}
              onChange={(evento) => mudarFatal(evento.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data-prazo-interno">Prazo interno</Label>
            <Input
              id="data-prazo-interno"
              type="date"
              value={interno}
              max={data || undefined}
              aria-invalid={Boolean(erroInterno)}
              aria-describedby={erroInterno ? "erro-prazo-interno" : undefined}
              onChange={(evento) => setInternoEscolhido(evento.target.value)}
            />
            {erroInterno && (
              <p id="erro-prazo-interno" role="alert" className="text-sm text-erro">
                {erroInterno}
              </p>
            )}
          </div>
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
            disabled={!data || Boolean(erroInterno)}
            onClick={editada ? () => setConferindo(true) : confirmar}
            className="sm:flex-1"
          >
            Confirmo o prazo
          </Button>
          <Button variant="outline" onClick={() => setEditando((atual) => !atual)}>
            {editando ? "Fechar edição" : "Editar datas"}
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
