"use client";

import type { InspecaoModelo } from "@tesia/documentos";
import { CheckCircle2, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { previaModelo } from "@/app/app/configuracoes/modelo-acoes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dataEnvio } from "./formatar-data";
import { MenuTimbrado } from "./menu-timbrado";
import { PaginaA4 } from "./pagina-a4";

type TimbradoAtivoProps = {
  nome: string;
  enviadoEm: string | null;
  aoTrocar: () => void;
  aoRemover: () => void;
};

type EstadoPrevia = { previa: InspecaoModelo } | { erro: string } | null;

function usePrevia(chave: string | null) {
  const [carregada, setCarregada] = useState<{ chave: string | null; estado: EstadoPrevia }>();
  useEffect(() => {
    let atual = true;
    previaModelo().then((estado) => {
      if (atual) setCarregada({ chave, estado });
    });
    return () => {
      atual = false;
    };
  }, [chave]);
  return carregada?.chave === chave ? carregada.estado : null;
}

function Previa({ estado }: { estado: EstadoPrevia }) {
  if (!estado) return <Skeleton className="aspect-[210/297] w-full" />;
  if ("erro" in estado) {
    return (
      <p className="rounded-md border bg-card p-4 text-sm text-texto-secundario">{estado.erro}</p>
    );
  }
  return <PaginaA4 previa={estado.previa} />;
}

export function TimbradoAtivo({ nome, enviadoEm, aoTrocar, aoRemover }: TimbradoAtivoProps) {
  const estado = usePrevia(enviadoEm);
  const data = dataEnvio(enviadoEm);
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section
        id="previa-timbrado"
        aria-label="Prévia da peça com o seu timbrado"
        className="scroll-mt-20"
      >
        <Previa estado={estado} />
      </section>
      <Card className="flex min-w-0 flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-titulo">Timbrado em uso</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-sucesso-fundo px-2.5 py-0.5 text-xs font-semibold text-sucesso">
            <CheckCircle2 aria-hidden className="size-3.5" />
            Ativo
          </span>
        </div>
        <div className="flex items-start gap-3">
          <div aria-hidden className="shrink-0">
            {estado && "previa" in estado ? (
              <PaginaA4 previa={estado.previa} escala={0.1} />
            ) : (
              <Skeleton className="h-[119px] w-[84px]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium" title={nome}>
              {nome}
            </p>
            {data && <p className="text-xs text-texto-secundario">Enviado em {data}</p>}
            <p className="mt-2 text-sm text-texto-secundario">
              Todas as peças baixadas saem com ele.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <a href="/app/configuracoes/modelo/teste" download>
              <Download aria-hidden />
              Baixar peça de teste
            </a>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={aoTrocar} className="flex-1">
              Trocar timbrado
            </Button>
            <MenuTimbrado aoRemover={aoRemover} />
          </div>
        </div>
      </Card>
    </div>
  );
}
