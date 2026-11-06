"use client";

import { useState, type DragEvent, type ReactNode } from "react";
import { SeloStatus } from "@/components/selo-status";
import {
  DescricaoPrazo,
  diasRestantes,
  TituloPrazo,
  VencimentoPrazo,
} from "@/components/tabela-prazos";
import { colunaPrazo, type ColunaQuadro, type LinhaPrazo } from "@/lib/prazo";
import { cn } from "@/lib/utils";

const colunas: { id: ColunaQuadro; titulo: string }[] = [
  { id: "hoje", titulo: "Vence hoje" },
  { id: "proximos", titulo: "Próximos 3 dias" },
  { id: "depois", titulo: "Depois" },
  { id: "rascunho", titulo: "Rascunho pronto" },
  { id: "protocolado", titulo: "Protocolado" },
];

type QuadroPrazosProps = {
  prazos: LinhaPrazo[];
  acoes: (prazo: LinhaPrazo) => ReactNode;
  aoConcluir: (prazo: LinhaPrazo) => void;
};

function CartaoPrazo({ prazo, acoes }: Pick<QuadroPrazosProps, "acoes"> & { prazo: LinhaPrazo }) {
  const { id, cnj, diasUteis, status, tipo } = prazo;
  const dias = diasRestantes(diasUteis, status);
  const arrastavel = status !== "protocolado";

  return (
    <li
      draggable={arrastavel}
      onDragStart={(evento) => evento.dataTransfer.setData("text/prazo", id)}
      className={cn(
        "relative flex flex-col gap-1 rounded-md border bg-card p-3 pr-10 text-sm shadow-xs transition-colors hover:bg-muted/50",
        arrastavel && "md:cursor-grab",
      )}
    >
      <TituloPrazo prazo={prazo} />
      {cnj && <span className="text-xs break-words text-texto-secundario tabular-nums">{cnj}</span>}
      <DescricaoPrazo prazo={prazo} />
      <VencimentoPrazo prazo={prazo} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={cn("tabular-nums", dias.cor)}>{dias.texto}</span>
        <SeloStatus status={status} manual={Boolean(tipo)} />
      </div>
      <div className="absolute top-2 right-1 z-10">{acoes(prazo)}</div>
    </li>
  );
}

export function QuadroPrazos({ prazos, acoes, aoConcluir }: QuadroPrazosProps) {
  const [sobreProtocolado, setSobreProtocolado] = useState(false);
  const temDepois = prazos.some((prazo) => colunaPrazo(prazo) === "depois");
  const visiveis = colunas.filter(({ id }) => id !== "depois" || temDepois);

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
      <div
        className={cn(
          "grid items-start gap-3 md:grid-cols-2",
          temDepois ? "xl:grid-cols-5" : "lg:grid-cols-4",
        )}
      >
        {visiveis.map(({ id, titulo }) => {
          const itens = prazos.filter((prazo) => colunaPrazo(prazo) === id);
          const recebe = id === "protocolado";
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
                recebe && sobreProtocolado && "border-primaria bg-primaria-fundo",
              )}
            >
              <h2 className="flex items-center justify-between px-1 text-sm font-semibold">
                {titulo}
                <span className="text-texto-secundario tabular-nums">{itens.length}</span>
              </h2>
              {itens.length === 0 ? (
                <p className="px-1 py-3 text-xs text-texto-secundario">Nenhum prazo</p>
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
