"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { pedirAjuste } from "@/app/app/pecas/acoes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AjustePeca } from "@/lib/peca";

const AJUSTES_SEM_CUSTO = 3;
const INTERVALO_MS = 3000;

type PainelAjusteProps = {
  pecaId: string;
  ajuste: AjustePeca;
  desativado: boolean;
  alterado: boolean;
  aoAtingirLimite: () => void;
};

function textoRestantes(usados: number) {
  const restantes = Math.max(AJUSTES_SEM_CUSTO - usados, 0);
  if (restantes === 0) return "Os próximos ajustes desta peça contam como uma peça nova cada um.";
  return `${restantes} de ${AJUSTES_SEM_CUSTO} ajustes sem custo nesta peça`;
}

export function PainelAjuste({
  pecaId,
  ajuste,
  desativado,
  alterado,
  aoAtingirLimite,
}: PainelAjusteProps) {
  const [pedido, setPedido] = useState("");
  const [enviando, iniciar] = useTransition();
  const router = useRouter();
  const emAndamento = ajuste.status === "pendente" || ajuste.status === "processando";

  useEffect(() => {
    if (!emAndamento) return;
    const intervalo = setInterval(() => router.refresh(), INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [emAndamento, router]);

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (alterado) {
      toast.error("Salve a versão antes de pedir um ajuste.");
      return;
    }
    iniciar(async () => {
      const resultado = await pedirAjuste(pecaId, pedido);
      if ("limite" in resultado) {
        aoAtingirLimite();
        return;
      }
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      setPedido("");
      toast.success("Pedido enviado. A Lia está ajustando a peça.");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={aoEnviar}
      className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs"
    >
      <h2 className="text-lg font-semibold">Pedir ajuste à Lia</h2>
      <Label htmlFor="pedido-ajuste" className="font-normal text-texto-secundario">
        {textoRestantes(ajuste.usados)}
      </Label>
      {emAndamento ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-md bg-primaria-fundo p-3 text-sm"
        >
          <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin text-primaria" />A Lia
          está ajustando a peça. O texto atualiza sozinho quando ela terminar.
        </p>
      ) : (
        <>
          <textarea
            id="pedido-ajuste"
            rows={3}
            maxLength={500}
            value={pedido}
            disabled={desativado || enviando}
            onChange={(evento) => setPedido(evento.target.value)}
            placeholder="Ex.: reforce o argumento sobre os atestados médicos"
            className="w-full rounded-md border bg-card px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={desativado || enviando || pedido.trim().length < 5}
          >
            {enviando ? "Enviando..." : "Pedir ajuste"}
          </Button>
        </>
      )}
      {ajuste.status === "erro" && ajuste.erro && (
        <p role="alert" className="rounded-md bg-erro-fundo p-2 text-sm text-erro">
          {ajuste.erro} Este pedido não foi contado.
        </p>
      )}
    </form>
  );
}
