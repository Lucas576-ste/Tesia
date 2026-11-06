"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AbaDados() {
  const [excluindo, setExcluindo] = useState(false);

  function excluir() {
    setExcluindo(false);
    toast.info("Demonstração: nenhuma conta foi excluída.");
  }

  return (
    <Card className="flex flex-col gap-5 p-4">
      <section className="flex flex-col items-start gap-2">
        <h2 className="text-base font-semibold">Exportar tudo</h2>
        <p className="text-sm text-texto-secundario">
          Baixe suas peças, prazos e processos quando quiser.
        </p>
        <Button
          variant="outline"
          onClick={() => toast.info("Demonstração: nenhum arquivo foi gerado.")}
        >
          Exportar meus dados
        </Button>
      </section>
      <section className="flex flex-col items-start gap-2">
        <h2 className="text-base font-semibold">Excluir conta</h2>
        <p className="text-sm text-texto-secundario">
          Exporte seus dados antes. Depois de excluir, não é possível recuperar.
        </p>
        <Button variant="destructive" onClick={() => setExcluindo(true)}>
          Excluir conta
        </Button>
      </section>
      <Dialog open={excluindo} onOpenChange={setExcluindo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir sua conta?</DialogTitle>
            <DialogDescription>
              Peças, prazos, processos e o seu estilo serão apagados. Não é possível desfazer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={excluir}>
              Excluir conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
