"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ModalCancelarProps = {
  aberto: boolean;
  fundador: boolean;
  aoMudar: (aberto: boolean) => void;
};

export function ModalCancelar({ aberto, fundador, aoMudar }: ModalCancelarProps) {
  function cancelar() {
    aoMudar(false);
    toast.info("Demonstração: nenhuma assinatura foi cancelada.");
  }

  return (
    <Dialog open={aberto} onOpenChange={aoMudar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar a assinatura?</DialogTitle>
          <DialogDescription>
            Você pode exportar seus dados antes.
            {fundador && " O preço de fundador só vale enquanto a assinatura estiver ativa."}
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="outline"
          onClick={() => toast.info("Demonstração: nenhum arquivo foi gerado.")}
        >
          Exportar meus dados
        </Button>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Manter assinatura</Button>
          </DialogClose>
          <Button variant="destructive" onClick={cancelar}>
            Cancelar assinatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
