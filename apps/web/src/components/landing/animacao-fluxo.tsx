"use client";

import { ArrowRight, FileSearch, FileText, PenLine } from "lucide-react";
import { motion } from "motion/react";
import { Fragment } from "react";

const etapas = [
  { rotulo: "PDF", icone: FileText },
  { rotulo: "Análise", icone: FileSearch },
  { rotulo: "Rascunho", icone: PenLine },
];

export function AnimacaoFluxo() {
  return (
    <div className="flex items-center gap-2">
      {etapas.map(({ rotulo, icone: Icone }, indice) => (
        <Fragment key={rotulo}>
          {indice > 0 && <ArrowRight aria-hidden className="size-4 text-texto-secundario" />}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: indice * 0.5, duration: 0.3 }}
            className="flex flex-col items-center gap-1 rounded-md border bg-card px-3 py-2 text-xs font-medium"
          >
            <Icone aria-hidden className="size-4 text-primaria" />
            {rotulo}
          </motion.div>
        </Fragment>
      ))}
    </div>
  );
}
