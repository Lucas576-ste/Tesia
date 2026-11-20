"use client";

import { Copy, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { gerarNovoLinkAgenda } from "@/app/app/configuracoes/agenda-acoes";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APPS_AGENDA } from "@/lib/agenda-passos";
import { linkAgenda } from "@/lib/agenda";
import { copiarTexto } from "@/lib/copiar";
import { PassoAgenda } from "./passo-agenda";

export type DadosAgenda = { token: string; origem: string };

const OCULTAR_APOS_MS = 30_000;

export function AbaAgenda({ agenda }: { agenda: DadosAgenda }) {
  const [link, setLink] = useState(linkAgenda(agenda.origem, agenda.token));
  const [revelado, setRevelado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [gerando, iniciar] = useTransition();
  const mascarado = linkAgenda(agenda.origem, "*".repeat(24));

  useEffect(() => {
    if (!revelado) return;
    const temporizador = setTimeout(() => setRevelado(false), OCULTAR_APOS_MS);
    return () => clearTimeout(temporizador);
  }, [revelado]);

  function gerarNovoLink() {
    iniciar(async () => {
      const resultado = await gerarNovoLinkAgenda();
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      setLink(linkAgenda(agenda.origem, resultado.token));
      setRevelado(false);
      setConfirmando(false);
      toast.success("Novo link gerado. Assine de novo nas suas agendas.");
    });
  }

  return (
    <Card className="gap-5 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-titulo">Seus prazos na sua agenda</h2>
        <p className="text-sm text-texto-secundario">
          Os prazos confirmados aparecem no Google Agenda, Apple Calendário ou Outlook e se
          atualizam sozinhos.
        </p>
      </div>
      <PassoAgenda numero={1} titulo="Copie o seu link">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Input
              readOnly
              aria-label="Link da agenda"
              value={revelado ? link : mascarado}
              className="pr-10 font-mono text-xs"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-pressed={revelado}
              aria-label={revelado ? "Ocultar link" : "Mostrar link"}
              onClick={() => setRevelado((atual) => !atual)}
              className="absolute top-1/2 right-1 -translate-y-1/2"
            >
              {revelado ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            </Button>
          </div>
          <Button onClick={() => copiarTexto(link, "Link da agenda copiado.")}>
            <Copy aria-hidden />
            Copiar link
          </Button>
        </div>
      </PassoAgenda>
      <PassoAgenda numero={2} titulo="Adicione na sua agenda">
        <Tabs defaultValue={APPS_AGENDA[0].id} className="gap-3">
          <TabsList className="w-full flex-wrap justify-start sm:w-fit">
            {APPS_AGENDA.map(({ id, nome }) => (
              <TabsTrigger key={id} value={id}>
                {nome}
              </TabsTrigger>
            ))}
          </TabsList>
          {APPS_AGENDA.map(({ id, passos }) => (
            <TabsContent key={id} value={id}>
              <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm">
                {passos.map((passo) => (
                  <li key={passo}>{passo}</li>
                ))}
              </ol>
            </TabsContent>
          ))}
        </Tabs>
      </PassoAgenda>
      <p className="flex items-start gap-2 rounded-md bg-primaria-fundo px-3 py-2 text-sm">
        <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-primaria" />
        Trate o link como uma senha: quem tiver o link vê os seus prazos.
      </p>
      <p className="text-sm text-texto-secundario">
        Seu link vazou?{" "}
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="font-medium text-primaria underline underline-offset-2"
        >
          Gerar novo link
        </button>
      </p>
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
            <Button onClick={gerarNovoLink} disabled={gerando}>
              Gerar novo link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
