"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProcessoAcompanhado } from "@/lib/clientes";
import { cn } from "@/lib/utils";
import { AcoesFase } from "./acoes-fase";

const SEM_FASE = "Fase não identificada";

export function SeloFase({ processo }: { processo: ProcessoAcompanhado }) {
  const [definindo, setDefinindo] = useState(false);
  const encerrado = processo.etapa === "encerrado";
  const semFase = !encerrado && processo.nomeFase === SEM_FASE;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium",
          encerrado && "bg-muted text-texto-secundario",
          semFase && "bg-atencao-fundo text-atencao",
          !encerrado && !semFase && "bg-primaria-fundo text-primaria",
        )}
      >
        {processo.nomeFase}
      </span>
      {semFase && (
        <>
          <button
            type="button"
            onClick={(evento) => {
              evento.preventDefault();
              evento.stopPropagation();
              setDefinindo(true);
            }}
            className="relative z-10 rounded-full border border-atencao/40 px-2 py-0.5 text-xs font-medium text-atencao hover:bg-atencao-fundo"
          >
            Definir fase
          </button>
          <Dialog open={definindo} onOpenChange={setDefinindo}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Em que fase está o processo?</DialogTitle>
                <DialogDescription className="font-mono text-xs">{processo.cnj}</DialogDescription>
              </DialogHeader>
              <AcoesFase
                processoId={processo.id}
                rito={processo.rito}
                fase={processo.fase}
                encerrado={false}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </span>
  );
}
