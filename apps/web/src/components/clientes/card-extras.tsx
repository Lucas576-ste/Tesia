"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { salvarExtras } from "@/app/app/clientes/acoes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClienteResumo } from "@/lib/clientes";

export function CardExtras({ cliente }: { cliente: ClienteResumo }) {
  const router = useRouter();
  const [pix, setPix] = useState(cliente.pix ?? "");
  const [observacoes, setObservacoes] = useState(cliente.observacoes ?? "");
  const [salvando, iniciar] = useTransition();
  const mudou = pix !== (cliente.pix ?? "") || observacoes !== (cliente.observacoes ?? "");

  function salvar() {
    iniciar(async () => {
      const resultado = await salvarExtras(cliente.id, { pix, observacoes });
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Salvo.");
      router.refresh();
    });
  }

  return (
    <Card className="gap-3 p-4">
      <div>
        <h2 className="text-lg font-semibold">Observações e PIX</h2>
        <p className="text-xs text-texto-secundario">Só o seu escritório vê.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cliente-pix">Chave PIX (para repassar alvarás e acordos)</Label>
        <Input
          id="cliente-pix"
          value={pix}
          maxLength={140}
          onChange={(e) => setPix(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cliente-observacoes">Observações internas</Label>
        <textarea
          id="cliente-observacoes"
          value={observacoes}
          maxLength={5000}
          rows={4}
          onChange={(e) => setObservacoes(e.target.value)}
          className="rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <Button onClick={salvar} disabled={salvando || !mudou} className="self-end" size="sm">
        {salvando ? "Salvando..." : "Salvar"}
      </Button>
    </Card>
  );
}
