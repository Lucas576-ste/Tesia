"use client";

import { toast } from "sonner";
import { EstadoErro } from "@/components/estado-erro";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ExemploModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir modal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar como protocolado?</DialogTitle>
          <DialogDescription>O prazo será concluído e sairá da lista de abertos.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Confirmar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExemploToast() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast.success("Prazo confirmado.")}>
        Sucesso
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("Não foi possível salvar. Tente de novo.")}
      >
        Erro
      </Button>
      <Button variant="outline" onClick={() => toast.warning("Você usou 80% das peças do mês.")}>
        Aviso
      </Button>
      <Button variant="outline" onClick={() => toast.info("Análise da intimação concluída.")}>
        Processamento concluído
      </Button>
    </div>
  );
}

export function ExemploEstadoErro() {
  return (
    <EstadoErro
      descricao="Não foi possível carregar os prazos."
      aoTentarDeNovo={() => toast("Tentando de novo.")}
    />
  );
}
