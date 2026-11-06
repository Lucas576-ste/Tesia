"use client";

import { CircleHelp, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const perguntas = [
  {
    pergunta: "Como o prazo é calculado?",
    resposta:
      "A IA extrai os dados da intimação, o cálculo é feito por regras fixas e você confirma a data. Você vê a conta inteira antes de confirmar.",
  },
  {
    pergunta: "A Tesia protocola por mim?",
    resposta:
      "Não. Você revisa o rascunho, baixa o .docx e protocola no sistema do tribunal. Depois, marca o prazo como protocolado.",
  },
  {
    pergunta: "Como adiciono uma audiência ou um prazo sem intimação?",
    resposta: 'Use o botão "Adicionar" na barra superior e escolha "Novo prazo manual".',
  },
  {
    pergunta: "Como levo meus dados?",
    resposta: "Em Configurações, na aba Dados, você exporta suas peças, prazos e processos.",
  },
];

export function AjudaFlutuante() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "");
  const noEditor = /^\/app\/pecas\/[^/]+$/.test(usePathname());

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Ajuda"
          className={cn(
            "fixed right-4 bottom-20 z-30 rounded-full bg-card shadow-md md:bottom-4",
            noEditor && "max-md:hidden",
          )}
        >
          <CircleHelp aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuda</DialogTitle>
          <DialogDescription>Respostas rápidas sobre o uso da Tesia.</DialogDescription>
        </DialogHeader>
        <Accordion type="single" collapsible>
          {perguntas.map(({ pergunta, resposta }) => (
            <AccordionItem key={pergunta} value={pergunta}>
              <AccordionTrigger>{pergunta}</AccordionTrigger>
              <AccordionContent className="text-texto-secundario">{resposta}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {whatsapp && (
          <Button asChild variant="outline">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden />
              Falar no WhatsApp
            </a>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
