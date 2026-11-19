"use client";

import { useState, type DragEvent, type ReactNode } from "react";
import { SeloStatus } from "@/components/selo-status";
import { SeloUrgencia } from "@/components/selo-urgencia";
import {
  DescricaoPrazo,
  PrazoInterno,
  TituloPrazo,
  VencimentoPrazo,
} from "@/components/tabela-prazos";
import type { ColunaQuadro, LinhaPrazo } from "@/lib/prazo";
import { nivelDoPrazo } from "@/lib/urgencia";
import { cn } from "@/lib/utils";

const colunas: { id: ColunaQuadro; titulo: string }[] = [
  { id: "vencido", titulo: "Vencidos" },
  { id: "hoje", titulo: "Vence hoje" },
  { id: "ate3", titulo: "Próximos 3 dias" },
  { id: "mais3", titulo: "Mais de 3 dias" },
  { id: "concluido", titulo: "Protocolado" },
];

type QuadroPrazosProps = {
  prazos: LinhaPrazo[];
  acoes: (prazo: LinhaPrazo) => ReactNode;
  aoConcluir: (prazo: LinhaPrazo) => void;
};

function CartaoPrazo({ prazo, acoes }: Pick<QuadroPrazosProps, "acoes"> & { prazo: LinhaPrazo }) {
  const { id, cnj, status, tipo } = prazo;
  const arrastavel = status !== "protocolado";
  const ehPrazo = !tipo || tipo === "prazo";

  return (
    <li
      draggable={arrastavel}
      onDragStart={(evento) => evento.dataTransfer.setData("text/prazo", id)}
      className={cn(
        "relative flex flex-col gap-1.5 rounded-lg border bg-card p-3 pr-10 text-sm shadow-xs transition-colors hover:border-primary/60",
        arrastavel && "md:cursor-grab",
      )}
    >
      <TituloPrazo prazo={prazo} />
      {cnj && <span className="font-mono text-[11px] text-texto-secundario">{cnj}</span>}
      <span className="text-texto-secundario">
        <DescricaoPrazo prazo={prazo} />
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold">
          <VencimentoPrazo prazo={prazo} />
        </span>
        <SeloUrgencia prazo={prazo} />
      </div>
      {ehPrazo && prazo.prazoInterno && (
        <span className="text-xs">
          <PrazoInterno prazo={prazo} rotulo="Interno" />
        </span>
      )}
      {status !== "nao_iniciado" && (
        <div>
          <SeloStatus status={status} manual={Boolean(tipo)} />
        </div>
      )}
      <div className="absolute top-2 right-1 z-10">{acoes(prazo)}</div>
    </li>
  );
}

export function QuadroPrazos({ prazos, acoes, aoConcluir }: QuadroPrazosProps) {
  const [sobreProtocolado, setSobreProtocolado] = useState(false);

  function aoSoltar(evento: DragEvent<HTMLElement>) {
    evento.preventDefault();
    setSobreProtocolado(false);
    const prazo = prazos.find(({ id }) => id === evento.dataTransfer.getData("text/prazo"));
    if (prazo && prazo.status !== "protocolado") aoConcluir(prazo);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="hidden text-xs text-texto-secundario md:block">
        Arraste um cartão para Protocolado para concluir o prazo.
      </p>
      <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-5">
        {colunas.map(({ id, titulo }) => {
          const itens = prazos.filter((prazo) => nivelDoPrazo(prazo) === id);
          const recebe = id === "concluido";
          return (
            <section
              key={id}
              aria-label={titulo}
              onDragOver={
                recebe
                  ? (evento) => {
                      evento.preventDefault();
                      setSobreProtocolado(true);
                    }
                  : undefined
              }
              onDragLeave={recebe ? () => setSobreProtocolado(false) : undefined}
              onDrop={recebe ? aoSoltar : undefined}
              className={cn(
                "flex min-w-0 flex-col gap-2 rounded-xl border bg-muted/40 p-2",
                id === "vencido" && itens.length > 0 && "border-erro/40 bg-erro-fundo/40",
                recebe && sobreProtocolado && "border-primaria bg-primaria-fundo",
              )}
            >
              <h2 className="flex items-center justify-between px-1 text-sm font-semibold">
                <span className={cn(id === "vencido" && itens.length > 0 && "text-erro")}>
                  {titulo}
                </span>
                <span className="rounded-full bg-card px-2 text-xs text-texto-secundario tabular-nums">
                  {itens.length}
                </span>
              </h2>
              {itens.length === 0 ? (
                <p className="px-1 pb-1 text-xs text-texto-secundario">Nenhum prazo aqui ✓</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {itens.map((prazo) => (
                    <CartaoPrazo key={prazo.id} prazo={prazo} acoes={acoes} />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
