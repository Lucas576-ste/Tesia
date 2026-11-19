"use client";

import { camposFaltando, textoQualificacao, type Qualificacao } from "@tesia/shared";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { salvarQualificacao } from "@/app/app/clientes/acoes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClienteResumo } from "@/lib/clientes";
import { FormularioQualificacao } from "./formulario-qualificacao";

export function CardQualificacao({ cliente }: { cliente: ClienteResumo }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const faltando = camposFaltando(cliente);

  async function salvar(dados: Qualificacao) {
    const resultado = await salvarQualificacao(cliente.id, dados);
    if ("erro" in resultado) {
      toast.error(resultado.erro);
      return false;
    }
    toast.success("Qualificação salva. A Lia vai usar nas próximas peças.");
    setEditando(false);
    router.refresh();
    return true;
  }

  return (
    <Card className="gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Qualificação</h2>
          {faltando.length === 0 ? (
            <Badge className="border-transparent bg-sucesso-fundo text-sucesso">Completa</Badge>
          ) : (
            <Badge variant="secondary">
              {faltando.length === 1 ? "Falta 1 dado" : `Faltam ${faltando.length} dados`}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
          <Pencil aria-hidden />
          {faltando.length ? "Completar" : "Editar"}
        </Button>
      </div>
      <p className="text-sm text-texto-secundario">{textoQualificacao(cliente)}</p>
      {faltando.length > 0 && (
        <p className="text-xs text-texto-secundario">
          Falta: {faltando.join(", ")}. O que faltar sai como [CONFIRMAR] na peça.
        </p>
      )}
      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Qualificação de {cliente.nome}</DialogTitle>
            <DialogDescription>
              Usada em procurações, contratos e peças (art. 319 do CPC).
            </DialogDescription>
          </DialogHeader>
          <FormularioQualificacao cliente={cliente} aoSalvar={salvar} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
