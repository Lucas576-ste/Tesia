"use client";

import { CheckCircle2, TriangleAlert } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { confirmarPrazo } from "@/app/app/intimacoes/acoes";
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
import type { Analise, PrazoAnalise } from "@/lib/analise";
import { avisoDeDiaNaoUtil, recalcularPrazo, type Recebimento } from "@/lib/recalculo-prazo";
import { AvisoDePrazo } from "./aviso-de-prazo";
import { RecebimentoIntimacao } from "./recebimento-intimacao";
import {
  calcularPrazoInterno,
  DIAS_PRAZO_INTERNO,
  isoParaData as formatarData,
  prazoInternoSchema,
} from "@/lib/prazo-interno";

type BlocoPrazoProps = Pick<
  Analise,
  "prazo" | "motivoSemPrazo" | "avisoPrazo" | "hoje" | "regra" | "calendario" | "recebimento"
> & {
  intimacaoId: string;
  confirmado: boolean;
  aoMudarConfirmacao: (confirmado: boolean) => void;
};

type Base = {
  inicio: string | null;
  vencimento: string;
  interno: string | null;
  memoria: string[];
};

function baseInicial(prazo: PrazoAnalise | null): Base | null {
  if (!prazo) return null;
  return {
    inicio: prazo.inicioIso,
    vencimento: prazo.sugeridoIso,
    interno: prazo.internoIso,
    memoria: prazo.memoria,
  };
}

function motivoRecalculo(recebimento: Recebimento, temRegra: boolean) {
  if (recebimento.forma === "citacao")
    return "Na citação, o prazo começa conforme a forma da citação. Informe o prazo fatal.";
  if (!temRegra) return "Não há regra de prazo cadastrada para esta peça. Informe a data.";
  if (
    recebimento.forma === "portal" &&
    recebimento.abertura &&
    recebimento.abertura < recebimento.envio
  )
    return "A abertura não pode ser antes do envio.";
  return "Informe a data acima para eu calcular o prazo.";
}

function AvisoRegra() {
  return (
    <p role="note" className="flex gap-2 rounded-md bg-atencao-fundo p-2 text-sm text-atencao">
      <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />A regra deste prazo ainda não
      foi revisada por um advogado. Confira a contagem antes de confirmar.
    </p>
  );
}

export function BlocoPrazo({
  intimacaoId,
  prazo,
  motivoSemPrazo,
  avisoPrazo,
  hoje,
  regra,
  calendario,
  recebimento: recebimentoInicial,
  confirmado,
  aoMudarConfirmacao,
}: BlocoPrazoProps) {
  const [recebimento, setRecebimento] = useState<Recebimento>({
    ...recebimentoInicial,
    abertura: "",
  });
  const [alterouRecebimento, setAlterouRecebimento] = useState(false);
  const base: Base | null = alterouRecebimento
    ? recalcularPrazo(regra, calendario, recebimento, hoje)
    : baseInicial(prazo);
  const sugerida = base?.vencimento ?? "";
  const [fatalManual, setFatalManual] = useState<string | null>(
    prazo && prazo.vencimentoIso !== prazo.sugeridoIso ? prazo.vencimentoIso : null,
  );
  const data = fatalManual ?? sugerida;
  const [editando, setEditando] = useState(!prazo);
  const [conferindo, setConferindo] = useState(false);
  const [internoEscolhido, setInternoEscolhido] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();
  const internoPadrao =
    data && data === sugerida && base?.interno
      ? base.interno
      : data
        ? calcularPrazoInterno(data, hoje)
        : "";
  const interno = internoEscolhido ?? internoPadrao;
  const motivo = base
    ? null
    : alterouRecebimento
      ? motivoRecalculo(recebimento, Boolean(regra))
      : motivoSemPrazo;
  const erroInterno = data
    ? prazoInternoSchema(data).safeParse(interno).error?.issues[0]?.message
    : undefined;
  const editada = Boolean(sugerida) && data !== sugerida;
  const depoisDaSugerida = Boolean(sugerida) && data > sugerida;

  function mudarFatal(novaData: string) {
    setFatalManual(novaData);
    if (internoEscolhido && novaData && internoEscolhido > novaData) setInternoEscolhido(null);
  }

  function mudarRecebimento(novo: Recebimento) {
    setRecebimento(novo);
    setAlterouRecebimento(true);
    setFatalManual(null);
    setInternoEscolhido(null);
  }

  function confirmar() {
    iniciar(async () => {
      const resultado = await confirmarPrazo({
        intimacaoId,
        vencimento: data,
        interno,
        recalculo:
          alterouRecebimento && base?.inicio
            ? {
                sugerida: base.vencimento,
                inicio: base.inicio,
                memoria: base.memoria,
                regraRevisada: regra?.revisada ?? false,
              }
            : undefined,
      });
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      aoMudarConfirmacao(true);
      setEditando(false);
      setConferindo(false);
      toast.success(
        editada
          ? "Prazo confirmado. A data sugerida e a escolhida foram registradas."
          : "Prazo confirmado. Ele já aparece no painel.",
      );
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border-l-4 border-destaque bg-card p-4 shadow-xs">
      <h2 className="text-lg font-semibold">
        {confirmado ? "Prazo confirmado" : base ? "Prazo sugerido" : "Prazo"}
      </h2>
      <div>
        <p className="text-xs text-texto-secundario">Prazo fatal</p>
        <p className="font-serif text-3xl font-semibold tabular-nums">
          {data ? formatarData(data) : "Sem data"}
        </p>
        {regra && (
          <p className="text-sm text-texto-secundario">
            {regra.dias} dias {regra.contagem === "corridos" ? "corridos" : "úteis"} ·{" "}
            {regra.fundamento}
          </p>
        )}
        {editada && (
          <p className="text-sm text-texto-secundario tabular-nums">
            Data sugerida: {formatarData(sugerida)}
          </p>
        )}
      </div>
      <AvisoDePrazo texto={avisoPrazo} />
      <AvisoDePrazo texto={avisoDeDiaNaoUtil(data, calendario)} />
      <RecebimentoIntimacao
        recebimento={recebimento}
        bloqueado={confirmado || enviando}
        aoMudar={mudarRecebimento}
      />
      {motivo && (
        <p role="note" className="rounded-md bg-atencao-fundo p-2 text-sm text-atencao">
          {motivo}
        </p>
      )}
      {regra && !regra.revisada && base && <AvisoRegra />}
      <dl className="grid grid-cols-2 gap-3 text-sm tabular-nums">
        <div>
          <dt className="text-xs text-texto-secundario">Início da contagem</dt>
          <dd>{base?.inicio ? formatarData(base.inicio) : "Sem data"}</dd>
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
      {base && base.memoria.length > 0 && (
        <details className="rounded-md border p-3 text-sm">
          <summary className="cursor-pointer font-medium">Ver a conta do prazo</summary>
          <ul className="mt-2 flex flex-col gap-1 text-texto-secundario">
            {base.memoria.map((linha) => (
              <li key={linha}>{linha}</li>
            ))}
          </ul>
        </details>
      )}
      {(editando || !base) && !confirmado && (
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              aoMudarConfirmacao(false);
              setEditando(true);
            }}
          >
            Alterar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            disabled={!data || Boolean(erroInterno) || enviando}
            onClick={editada ? () => setConferindo(true) : confirmar}
            className="sm:flex-1"
          >
            {enviando ? "Confirmando..." : "Confirmo o prazo"}
          </Button>
          {base && (
            <Button variant="outline" onClick={() => setEditando((atual) => !atual)}>
              {editando ? "Fechar edição" : "Editar datas"}
            </Button>
          )}
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
              <dd className="font-medium">{sugerida ? formatarData(sugerida) : "Sem data"}</dd>
            </div>
            <div>
              <dt className="text-xs text-texto-secundario">Data escolhida</dt>
              <dd className="font-medium">{data ? formatarData(data) : "Sem data"}</dd>
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
            <Button onClick={confirmar} disabled={enviando}>
              Confirmar data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
