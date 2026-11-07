"use client";

import { useState, type FormEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LinhaPrazo } from "@/lib/prazo";
import { isoParaData, prazoInternoSchema } from "@/lib/prazo-interno";

function dataParaIso(data: string) {
  return data.split("/").reverse().join("-");
}

type ModalPrazoInternoProps = {
  prazo: LinhaPrazo | null;
  aoFechar: () => void;
  aoSalvar: (id: string, prazoInterno: string) => void;
};

function FormularioPrazoInterno({
  prazo,
  aoSalvar,
}: Pick<ModalPrazoInternoProps, "aoSalvar"> & { prazo: LinhaPrazo }) {
  const fatalIso = dataParaIso(prazo.vencimento);
  const [data, setData] = useState(prazo.prazoInterno ? dataParaIso(prazo.prazoInterno) : "");
  const [erro, setErro] = useState("");

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const resultado = prazoInternoSchema(fatalIso).safeParse(data);
    if (!resultado.success) {
      setErro(resultado.error.issues[0]?.message ?? "Confira a data.");
      return;
    }
    aoSalvar(prazo.id, isoParaData(resultado.data));
  }

  return (
    <form noValidate onSubmit={enviar} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="novo-prazo-interno">Prazo interno</Label>
        <Input
          id="novo-prazo-interno"
          type="date"
          value={data}
          max={fatalIso}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? "erro-novo-prazo-interno" : undefined}
          onChange={(evento) => {
            setData(evento.target.value);
            setErro("");
          }}
        />
        {erro && (
          <p id="erro-novo-prazo-interno" role="alert" className="text-sm text-erro">
            {erro}
          </p>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  );
}

export function ModalPrazoInterno({ prazo, aoFechar, aoSalvar }: ModalPrazoInternoProps) {
  return (
    <Dialog
      open={prazo !== null}
      onOpenChange={(aberto) => {
        if (!aberto) aoFechar();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar prazo interno</DialogTitle>
          <DialogDescription>
            {prazo?.peca}. O prazo fatal continua {prazo?.vencimento}.
          </DialogDescription>
        </DialogHeader>
        {prazo && <FormularioPrazoInterno key={prazo.id} prazo={prazo} aoSalvar={aoSalvar} />}
      </DialogContent>
    </Dialog>
  );
}
