"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { track } from "@/lib/medicao";

type AcordeaoPerguntasProps = {
  perguntas: { pergunta: string; resposta: ReactNode }[];
};

export function AcordeaoPerguntas({ perguntas }: AcordeaoPerguntasProps) {
  return (
    <Accordion
      type="single"
      collapsible
      onValueChange={(pergunta) => {
        if (pergunta) track("faq_open", { pergunta });
      }}
      className="rounded-xl border bg-card px-4 md:max-w-3xl"
    >
      {perguntas.map(({ pergunta, resposta }) => (
        <AccordionItem key={pergunta} value={pergunta}>
          <AccordionTrigger>{pergunta}</AccordionTrigger>
          <AccordionContent className="text-texto-secundario">{resposta}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
