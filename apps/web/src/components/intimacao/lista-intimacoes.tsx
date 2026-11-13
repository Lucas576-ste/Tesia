"use client";

import { AlertCircle, CheckCircle2, Clock, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EstadoVazio } from "@/components/estado-vazio";
import { Button } from "@/components/ui/button";
import {
  ROTULOS_SITUACAO,
  type ItemIntimacao,
  type SituacaoIntimacao,
} from "@/lib/situacao-intimacao";
import { cn } from "@/lib/utils";

const INTERVALO_MS = 5000;

const ESTILO_SITUACAO: Record<SituacaoIntimacao, string> = {
  fila: "text-texto-secundario",
  lendo: "text-texto-secundario",
  aguardando: "text-atencao",
  confirmado: "text-sucesso",
  erro: "text-erro",
};

function IconeSituacao({ situacao }: { situacao: SituacaoIntimacao }) {
  if (situacao === "confirmado") return <CheckCircle2 aria-hidden className="size-4 shrink-0" />;
  if (situacao === "aguardando") return <Clock aria-hidden className="size-4 shrink-0" />;
  if (situacao === "erro") return <AlertCircle aria-hidden className="size-4 shrink-0" />;
  return <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin" />;
}

type ListaIntimacoesProps = {
  itens: ItemIntimacao[];
  soPendentes: boolean;
};

export function ListaIntimacoes({ itens, soPendentes }: ListaIntimacoesProps) {
  const router = useRouter();
  const emAndamento = itens.some(({ situacao }) => situacao === "fila" || situacao === "lendo");
  const visiveis = soPendentes ? itens.filter(({ situacao }) => situacao === "aguardando") : itens;

  useEffect(() => {
    if (!emAndamento) return;
    const intervalo = setInterval(() => router.refresh(), INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [emAndamento, router]);

  if (visiveis.length === 0) {
    return soPendentes ? (
      <EstadoVazio
        titulo="Nada aguardando confirmação"
        descricao="Todas as intimações analisadas já têm o prazo confirmado."
        acao={
          <Button asChild variant="outline">
            <Link href="/app/intimacoes">Ver todas</Link>
          </Button>
        }
      />
    ) : (
      <EstadoVazio
        titulo="Nenhuma intimação enviada"
        descricao="Envie o PDF da intimação e eu leio, resumo e calculo o prazo."
        acao={
          <Button asChild>
            <Link href="/app/intimacoes/nova">Nova intimação</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col divide-y rounded-xl border bg-card shadow-xs">
      {visiveis.map(({ id, enviadaEm, partes, cnj, peca, situacao }) => (
        <li key={id}>
          <Link
            href={`/app/intimacoes/${id}`}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 text-sm hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
          >
            <span className="flex min-w-0 flex-1 basis-64 flex-col">
              <span className="font-medium">{partes}</span>
              <span className="text-xs text-texto-secundario tabular-nums">
                {[cnj, peca].filter(Boolean).join(" · ") || "Processo ainda não identificado"}
              </span>
            </span>
            <span className="text-xs text-texto-secundario tabular-nums">
              Enviada em {enviadaEm}
            </span>
            <span
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                ESTILO_SITUACAO[situacao],
              )}
            >
              <IconeSituacao situacao={situacao} />
              {ROTULOS_SITUACAO[situacao]}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
