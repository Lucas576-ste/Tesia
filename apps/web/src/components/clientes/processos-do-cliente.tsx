"use client";

import { FolderPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { processosDoCliente, type ProcessoDoCliente } from "@/app/app/clientes/acoes";
import { Badge } from "@/components/ui/badge";

type Estado = { ok: true; processos: ProcessoDoCliente[] } | { erro: string };

export function ProcessosDoCliente({ clienteId }: { clienteId: string }) {
  const [estado, setEstado] = useState<Estado | null>(null);

  useEffect(() => {
    let ativo = true;
    processosDoCliente(clienteId).then((resposta) => {
      if (ativo) setEstado(resposta);
    });
    return () => {
      ativo = false;
    };
  }, [clienteId]);

  return (
    <div
      aria-live="polite"
      className="flex flex-col gap-1.5 border-t bg-muted/30 py-2.5 pr-3 pl-15 text-sm"
    >
      {!estado && <p className="text-xs text-texto-secundario">Carregando processos...</p>}
      {estado && "erro" in estado && <p className="text-xs text-erro">{estado.erro}</p>}
      {estado && "ok" in estado && estado.processos.length === 0 && (
        <p className="text-xs text-texto-secundario">Nenhum processo vinculado.</p>
      )}
      {estado && "ok" in estado && (
        <ul className="flex flex-col gap-1">
          {estado.processos.map((processo) => (
            <li key={processo.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link href={`/app/processos/${processo.id}`} className="font-medium hover:underline">
                {processo.cnj}
              </Link>
              <span className="min-w-0 truncate text-xs text-texto-secundario">
                {processo.partes}
              </span>
              <Badge variant="secondary">{processo.fase}</Badge>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={`/app/clientes?aba=processos&novo=1&cliente=${clienteId}`}
        className="flex w-fit items-center gap-1 text-xs font-medium text-primaria hover:underline"
      >
        <FolderPlus aria-hidden className="size-3.5" />
        Novo processo deste cliente
      </Link>
    </div>
  );
}
