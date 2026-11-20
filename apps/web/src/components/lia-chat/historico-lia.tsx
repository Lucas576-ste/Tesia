"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apagarConversa, listarConversas, type ConversaResumo } from "@/app/app/lia-acoes";
import { Button } from "@/components/ui/button";
import { dataCurta } from "@/lib/data-br";

type HistoricoLiaProps = { aoAbrir: (id: string) => void };

export function HistoricoLia({ aoAbrir }: HistoricoLiaProps) {
  const [conversas, setConversas] = useState<ConversaResumo[] | null>(null);

  useEffect(() => {
    let atual = true;
    listarConversas().then((lista) => {
      if (atual) setConversas(lista);
    });
    return () => {
      atual = false;
    };
  }, []);

  async function apagar(id: string) {
    const resultado = await apagarConversa(id);
    if ("erro" in resultado) {
      toast.error(resultado.erro);
      return;
    }
    setConversas((atuais) => atuais?.filter((conversa) => conversa.id !== id) ?? null);
  }

  if (!conversas) return <p className="text-sm text-texto-secundario">Carregando…</p>;
  if (conversas.length === 0) {
    return <p className="text-sm text-texto-secundario">Você ainda não tem conversas salvas.</p>;
  }
  return (
    <ul className="flex flex-col divide-y rounded-xl border bg-card">
      {conversas.map((conversa) => (
        <li key={conversa.id} className="flex items-center gap-1 pr-1">
          <button
            type="button"
            onClick={() => aoAbrir(conversa.id)}
            className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-md p-3 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="truncate text-sm font-medium">{conversa.titulo}</span>
            <span className="text-xs text-texto-secundario">
              {dataCurta(conversa.atualizadaEm)}
            </span>
          </button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Apagar conversa ${conversa.titulo}`}
            onClick={() => void apagar(conversa.id)}
          >
            <Trash2 aria-hidden />
          </Button>
        </li>
      ))}
    </ul>
  );
}
