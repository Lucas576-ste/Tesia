"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const AJUSTES_POR_PECA = 3;

export function PainelAjuste({ desativado }: { desativado: boolean }) {
  const [pedido, setPedido] = useState("");
  const [enviado, setEnviado] = useState(false);

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviado(true);
  }

  return (
    <form
      onSubmit={aoEnviar}
      className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs"
    >
      <h2 className="text-lg font-semibold">Pedir ajuste à Lia</h2>
      <Label htmlFor="pedido-ajuste" className="font-normal text-texto-secundario">
        {AJUSTES_POR_PECA} ajustes restantes nesta peça
      </Label>
      <textarea
        id="pedido-ajuste"
        rows={3}
        value={pedido}
        disabled={desativado}
        onChange={(evento) => {
          setPedido(evento.target.value);
          setEnviado(false);
        }}
        placeholder="Ex.: reforce o argumento da prescrição"
        className="w-full rounded-md border bg-card px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
      />
      <Button type="submit" variant="outline" disabled={desativado || !pedido.trim()}>
        Pedir ajuste
      </Button>
      {enviado && (
        <p role="status" className="rounded-md bg-atencao-fundo p-2 text-sm text-atencao">
          Demonstração: o ajuste pela IA ainda não está ligado, e nenhum ajuste foi gasto.
        </p>
      )}
    </form>
  );
}
