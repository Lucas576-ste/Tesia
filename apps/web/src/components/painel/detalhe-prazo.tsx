"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SeloStatus } from "@/components/selo-status";
import { SeloUrgencia } from "@/components/selo-urgencia";
import { DescricaoPrazo, PrazoInterno, VencimentoPrazo } from "@/components/tabela-prazos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { destinoPrazo, type LinhaPrazo } from "@/lib/prazo";

type DetalhePrazoProps = {
  prazo: LinhaPrazo | null;
  aoFechar: () => void;
  acoes: (prazo: LinhaPrazo) => ReactNode;
  aoConcluir: (prazo: LinhaPrazo) => void;
};

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-texto-secundario">{rotulo}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function DetalhePrazo({ prazo, aoFechar, acoes, aoConcluir }: DetalhePrazoProps) {
  const href = prazo ? destinoPrazo(prazo) : null;
  const ehPrazo = prazo && (!prazo.tipo || prazo.tipo === "prazo");

  return (
    <Dialog open={Boolean(prazo)} onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DialogContent className="sm:max-w-md">
        {prazo && (
          <>
            <DialogHeader>
              <DialogTitle className="pr-6">{prazo.partes}</DialogTitle>
              {prazo.cnj && (
                <DialogDescription className="font-mono text-xs">{prazo.cnj}</DialogDescription>
              )}
            </DialogHeader>
            <dl className="grid gap-3">
              <Linha rotulo="O que fazer">
                <DescricaoPrazo prazo={prazo} />
              </Linha>
              <Linha rotulo="Vencimento">
                <span className="flex flex-wrap items-center gap-2 text-base font-semibold">
                  <VencimentoPrazo prazo={prazo} />
                  <SeloUrgencia prazo={prazo} />
                </span>
              </Linha>
              {ehPrazo && prazo.prazoInterno && (
                <Linha rotulo="Prazo interno">
                  <PrazoInterno prazo={prazo} />
                </Linha>
              )}
              <Linha rotulo="Status">
                <SeloStatus status={prazo.status} manual={Boolean(prazo.tipo)} />
              </Linha>
            </dl>
            <DialogFooter className="items-center gap-2 sm:justify-between">
              <div>{acoes(prazo)}</div>
              <div className="flex flex-wrap gap-2">
                {href && (
                  <Button asChild variant="outline">
                    <Link href={href}>Abrir</Link>
                  </Button>
                )}
                {prazo.status !== "protocolado" && (
                  <Button
                    onClick={() => {
                      aoConcluir(prazo);
                      aoFechar();
                    }}
                  >
                    Marcar como protocolado
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
