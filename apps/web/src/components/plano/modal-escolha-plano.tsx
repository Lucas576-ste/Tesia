"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { planosEscolhaExemplo } from "@/lib/conta-exemplo";
import type { IdPlanoDemo } from "@/lib/planos-exemplo";

type ModalEscolhaPlanoProps = {
  aberto: boolean;
  fimDoTeste: boolean;
  planoAtual: IdPlanoDemo;
  aoMudar: (aberto: boolean) => void;
};

export function ModalEscolhaPlano({
  aberto,
  fimDoTeste,
  planoAtual,
  aoMudar,
}: ModalEscolhaPlanoProps) {
  const [escolhido, setEscolhido] = useState("pro");
  const opcoes = planosEscolhaExemplo.filter(({ id }) => fimDoTeste || id !== planoAtual);
  const plano = opcoes.some(({ id }) => id === escolhido) ? escolhido : opcoes[0]?.id;

  function continuar() {
    aoMudar(false);
    toast.info("A cobrança ainda não está ligada. Nenhum valor foi cobrado.");
  }

  return (
    <Dialog open={aberto} onOpenChange={aoMudar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fimDoTeste ? "Seu teste grátis terminou" : "Mudar de plano"}</DialogTitle>
          <DialogDescription>
            {fimDoTeste
              ? "Seus dados continuam guardados. Escolha um plano para voltar a gerar peças."
              : "Escolha o plano que faz mais sentido para você."}
          </DialogDescription>
        </DialogHeader>
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Planos</legend>
          {opcoes.map(({ id, nome, preco, resumo }) => (
            <label
              key={id}
              className="flex cursor-pointer items-start gap-2 rounded-md border bg-card p-3 text-sm has-checked:border-primaria has-checked:bg-primaria-fundo has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
            >
              <input
                type="radio"
                name="plano"
                checked={plano === id}
                onChange={() => setEscolhido(id)}
                className="mt-0.5 accent-primaria"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{nome}</span>
                <span className="text-xs text-texto-secundario">{resumo}</span>
              </span>
              <span className="tabular-nums">{preco}</span>
            </label>
          ))}
        </fieldset>
        <DialogFooter>
          <Button onClick={continuar}>Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
