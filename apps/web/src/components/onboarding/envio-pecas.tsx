"use client";

import { CheckCircle2, CircleAlert, FileText, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { ZonaUpload } from "@/components/zona-upload";
import { cn } from "@/lib/utils";
import { PainelAprendizado } from "./painel-aprendizado";

const MINIMO = 5;
const MAXIMO = 10;
const FORMATOS = /\.(pdf|docx?)$/i;

type StatusPeca = "enviando" | "lendo" | "lido" | "erro";

type Peca = {
  id: number;
  nome: string;
  status: StatusPeca;
  erro?: string;
};

const rotulos: Record<Exclude<StatusPeca, "erro">, string> = {
  enviando: "Enviando",
  lendo: "Lendo",
  lido: "Lido",
};

function StatusArquivo({ peca }: { peca: Peca }) {
  if (peca.status === "erro") {
    return (
      <span className="flex items-center gap-1 text-xs text-erro">
        <CircleAlert aria-hidden className="size-4 shrink-0" />
        {peca.erro}
      </span>
    );
  }

  const lido = peca.status === "lido";
  const Icone = lido ? CheckCircle2 : LoaderCircle;
  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs",
        lido ? "text-sucesso" : "text-texto-secundario",
      )}
    >
      <Icone aria-hidden className={cn("size-4 shrink-0", !lido && "animate-spin")} />
      {rotulos[peca.status]}
    </span>
  );
}

export function EnvioPecas() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [avisoAberto, setAvisoAberto] = useState(false);
  const proximoId = useRef(0);
  const temporizadores = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const ativos = temporizadores.current;
    return () => ativos.forEach(clearTimeout);
  }, []);

  const lidas = pecas.filter(({ status }) => status === "lido").length;
  const pronto = lidas >= MINIMO;

  function agendar(id: number, status: StatusPeca, espera: number) {
    const temporizador = setTimeout(() => {
      temporizadores.current.delete(temporizador);
      setPecas((atuais) => atuais.map((peca) => (peca.id === id ? { ...peca, status } : peca)));
    }, espera);
    temporizadores.current.add(temporizador);
  }

  function adicionar(arquivos: File[]) {
    let validas = pecas.filter(({ status }) => status !== "erro").length;
    const novas = arquivos.map<Peca>((arquivo) => {
      const id = proximoId.current++;
      if (!FORMATOS.test(arquivo.name)) {
        return { id, nome: arquivo.name, status: "erro", erro: "Envie PDF ou Word" };
      }
      if (validas >= MAXIMO) {
        return { id, nome: arquivo.name, status: "erro", erro: `Limite de ${MAXIMO} peças` };
      }
      validas += 1;
      agendar(id, "lendo", 500);
      agendar(id, "lido", 1200);
      return { id, nome: arquivo.name, status: "enviando" };
    });
    setPecas((atuais) => [...atuais, ...novas]);
  }

  function remover(id: number) {
    setPecas((atuais) => atuais.filter((peca) => peca.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <ZonaUpload
        titulo="Arraste suas peças ou clique para escolher"
        descricao={`De ${MINIMO} a ${MAXIMO} peças em PDF ou Word`}
        accept=".pdf,.doc,.docx"
        aoEscolher={adicionar}
      />
      <p role="status" className="text-sm font-medium tabular-nums">
        {lidas} de {MINIMO} peças lidas
      </p>
      {pecas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {pecas.map((peca) => (
            <li
              key={peca.id}
              className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-2 text-sm"
            >
              <FileText aria-hidden className="size-4 shrink-0 text-texto-secundario" />
              <span className="min-w-0 flex-1 break-all">{peca.nome}</span>
              <span className="order-last w-full pl-6 sm:order-none sm:w-auto sm:pl-0">
                <StatusArquivo peca={peca} />
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remover ${peca.nome}`}
                onClick={() => remover(peca.id)}
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {lidas > 0 && <PainelAprendizado />}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        <Button asChild variant="ghost" className="sm:mr-auto">
          <Link href="/onboarding/perfil">Voltar</Link>
        </Button>
        {!pronto && (
          <Button variant="outline" onClick={() => setAvisoAberto(true)}>
            Pular por enquanto
          </Button>
        )}
        {pronto ? (
          <Button asChild>
            <Link href="/onboarding/modelo">Continuar</Link>
          </Button>
        ) : (
          <Button onClick={() => setAvisoAberto(true)}>Continuar</Button>
        )}
      </div>
      <Dialog open={avisoAberto} onOpenChange={setAvisoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Continuar com menos de {MINIMO} peças?</DialogTitle>
            <DialogDescription>
              O rascunho fica genérico até você enviar suas peças. Você pode voltar a isso depois,
              em Meu estilo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Enviar mais peças</Button>
            </DialogClose>
            <Button asChild>
              <Link href="/onboarding/modelo">Continuar assim</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
