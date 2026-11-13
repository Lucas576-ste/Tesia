"use client";

import { FileText, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StatusPeca } from "@/components/estilo/status-peca";
import { usePecasEstilo } from "@/components/estilo/usar-pecas-estilo";
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
import {
  ACEITOS_PECA_ESTILO,
  MAXIMO_PECAS_ESTILO as MAXIMO,
  MINIMO_PECAS_ESTILO as MINIMO,
  type PecaEstilo,
} from "@/lib/estilo";
import type { EstadoPerfil } from "@/lib/perfil-estilo";
import { PainelAprendizado } from "./painel-aprendizado";

type EnvioPecasProps = {
  escritorioId: string;
  usuarioId: string;
  pecasIniciais: PecaEstilo[];
  perfil: EstadoPerfil;
};

export function EnvioPecas({ escritorioId, usuarioId, pecasIniciais, perfil }: EnvioPecasProps) {
  const { pecas, adicionar, remover, lidas } = usePecasEstilo(
    escritorioId,
    usuarioId,
    pecasIniciais,
  );
  const [avisoAberto, setAvisoAberto] = useState(false);
  const pronto = lidas >= MINIMO;

  return (
    <div className="flex flex-col gap-4">
      <ZonaUpload
        titulo="Arraste suas peças ou clique para escolher"
        descricao={`De ${MINIMO} a ${MAXIMO} peças em PDF ou Word (.docx)`}
        accept={ACEITOS_PECA_ESTILO}
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
                <StatusPeca peca={peca} />
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remover ${peca.nome}`}
                onClick={() => void remover(peca.id)}
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {(lidas > 0 || perfil.estado !== "vazio") && <PainelAprendizado perfil={perfil} />}
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
