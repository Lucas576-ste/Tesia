"use client";

import { Copy } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LINK_AGENDA_EXEMPLO, passosAgenda } from "@/lib/conta-exemplo";
import { copiarTexto } from "@/lib/copiar";

export function AbaAgenda() {
  const [link, setLink] = useState(LINK_AGENDA_EXEMPLO);
  const [confirmando, setConfirmando] = useState(false);

  function gerarNovoLink() {
    setLink(`https://exemplo.tesia/agenda/${crypto.randomUUID()}.ics`);
    setConfirmando(false);
    toast.success("Novo link de exemplo gerado.");
  }

  return (
    <Card className="flex flex-col gap-4 p-4">
      <p className="text-sm text-texto-secundario">
        Link de exemplo. Ele passa a funcionar quando a agenda for lançada. Trate o link real como
        uma senha: quem tiver o link vê os seus prazos.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="link-agenda">Link da agenda</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input id="link-agenda" readOnly value={link} className="min-w-0 flex-1" />
          <Button variant="outline" onClick={() => copiarTexto(link, "Link da agenda copiado.")}>
            <Copy aria-hidden />
            Copiar
          </Button>
        </div>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {passosAgenda.map(({ nome, passo }) => (
          <li key={nome}>
            <span className="font-medium">{nome}:</span> {passo}
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        className="w-full sm:w-auto sm:self-end"
        onClick={() => setConfirmando(true)}
      >
        Gerar novo link
      </Button>
      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar um novo link?</DialogTitle>
            <DialogDescription>
              O link atual para de funcionar, e você precisa assinar o novo nas suas agendas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={gerarNovoLink}>Gerar novo link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
