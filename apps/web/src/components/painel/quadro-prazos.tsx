"use client";

import { Maximize2 } from "lucide-react";
import { useState, type DragEvent, type ReactNode } from "react";
import { SeloUrgencia } from "@/components/selo-urgencia";
import { VencimentoPrazo } from "@/components/tabela-prazos";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { nomeCurto } from "@/lib/nome-curto";
import type { ColunaQuadro, LinhaPrazo } from "@/lib/prazo";
import { nivelDoPrazo } from "@/lib/urgencia";
import { cn } from "@/lib/utils";
import { DetalhePrazo } from "./detalhe-prazo";

const colunas: { id: ColunaQuadro; titulo: string }[] = [
  { id: "vencido", titulo: "Vencidos" },
  { id: "hoje", titulo: "Vence hoje" },
  { id: "ate3", titulo: "Próximos 3 dias" },
  { id: "mais3", titulo: "Mais de 3 dias" },
  { id: "concluido", titulo: "Protocolado" },
];

const LIMITE_CELULAR = 3;

type QuadroPrazosProps = {
  prazos: LinhaPrazo[];
  acoes: (prazo: LinhaPrazo) => ReactNode;
  aoConcluir: (prazo: LinhaPrazo) => void;
};

function CartaoPrazo({
  prazo,
  aoAbrir,
  className,
}: {
  prazo: LinhaPrazo;
  aoAbrir: (prazo: LinhaPrazo) => void;
  className?: string;
}) {
  const arrastavel = prazo.status !== "protocolado";
  return (
    <li className={className}>
      <button
        type="button"
        draggable={arrastavel}
        onDragStart={(evento) => evento.dataTransfer.setData("text/prazo", prazo.id)}
        onClick={() => aoAbrir(prazo)}
        className={cn(
          "flex w-full flex-col gap-1 rounded-lg border bg-card p-2.5 text-left text-sm shadow-xs transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          arrastavel && "md:cursor-grab",
        )}
      >
        <span className="truncate font-medium" title={prazo.partes}>
          {nomeCurto(prazo.partes)}
        </span>
        <span className="truncate text-xs text-texto-secundario">{prazo.peca}</span>
        <span className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <VencimentoPrazo prazo={prazo} />
          <SeloUrgencia prazo={prazo} />
        </span>
      </button>
    </li>
  );
}

export function QuadroPrazos({ prazos, acoes, aoConcluir }: QuadroPrazosProps) {
  const [sobreProtocolado, setSobreProtocolado] = useState(false);
  const [aberto, setAberto] = useState<LinhaPrazo | null>(null);
  const [expandida, setExpandida] = useState<ColunaQuadro | null>(null);

  function aoSoltar(evento: DragEvent<HTMLElement>) {
    evento.preventDefault();
    setSobreProtocolado(false);
    const prazo = prazos.find(({ id }) => id === evento.dataTransfer.getData("text/prazo"));
    if (prazo && prazo.status !== "protocolado") aoConcluir(prazo);
  }

  function abrir(prazo: LinhaPrazo) {
    setExpandida(null);
    setAberto(prazo);
  }

  const itensDe = (id: ColunaQuadro) => prazos.filter((prazo) => nivelDoPrazo(prazo) === id);
  const colunaExpandida = colunas.find(({ id }) => id === expandida);

  return (
    <div className="flex flex-col gap-2">
      <p className="hidden text-xs text-texto-secundario md:block">
        Clique num cartão para ver os detalhes. Arraste para Protocolado para concluir.
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {colunas.map(({ id, titulo }) => {
          const itens = itensDe(id);
          const recebe = id === "concluido";
          const alerta = id === "vencido" && itens.length > 0;
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
                "flex min-w-0 flex-col self-start rounded-xl border bg-muted/40",
                itens.length > 0 && "md:h-[28rem] md:self-stretch",
                alerta && "border-erro/40 bg-erro-fundo/40",
                recebe && sobreProtocolado && "border-primaria bg-primaria-fundo",
              )}
            >
              <h2 className="flex items-center justify-between gap-2 border-b px-3 py-2 text-xs font-semibold tracking-wide uppercase">
                <span className={cn("truncate", alerta && "text-erro")}>{titulo}</span>
                <span className="flex items-center gap-1">
                  <span className="rounded-full bg-card px-2 text-texto-secundario tabular-nums">
                    {itens.length}
                  </span>
                  {itens.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandida(id)}
                      aria-label={`Ver todos de ${titulo}`}
                      className="rounded p-1 text-texto-secundario hover:bg-card hover:text-foreground"
                    >
                      <Maximize2 className="size-3.5" />
                    </button>
                  )}
                </span>
              </h2>
              {itens.length === 0 ? (
                <p className="p-3 text-xs text-texto-secundario">Nenhum prazo aqui ✓</p>
              ) : (
                <ul className="flex flex-1 flex-col gap-2 p-2 md:overflow-y-auto">
                  {itens.map((prazo, indice) => (
                    <CartaoPrazo
                      key={prazo.id}
                      prazo={prazo}
                      aoAbrir={abrir}
                      className={cn(indice >= LIMITE_CELULAR && "hidden md:block")}
                    />
                  ))}
                  {itens.length > LIMITE_CELULAR && (
                    <li className="md:hidden">
                      <button
                        type="button"
                        onClick={() => setExpandida(id)}
                        className="w-full rounded-lg py-1.5 text-xs font-medium text-primaria hover:bg-card"
                      >
                        Ver todos ({itens.length})
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      <Dialog open={Boolean(expandida)} onOpenChange={(valor) => !valor && setExpandida(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {colunaExpandida?.titulo} ({expandida ? itensDe(expandida).length : 0})
            </DialogTitle>
          </DialogHeader>
          <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
            {expandida &&
              itensDe(expandida).map((prazo) => (
                <CartaoPrazo key={prazo.id} prazo={prazo} aoAbrir={abrir} />
              ))}
          </ul>
        </DialogContent>
      </Dialog>
      <DetalhePrazo
        prazo={aberto}
        aoFechar={() => setAberto(null)}
        acoes={acoes}
        aoConcluir={aoConcluir}
      />
    </div>
  );
}
