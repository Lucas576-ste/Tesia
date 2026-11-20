"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ItemAprendizado as Item } from "@/lib/perfil-estilo";
import { cn } from "@/lib/utils";

type ItemAprendizadoProps = {
  item: Item;
  salvando: boolean;
  aoAvaliar: (item: Item, avaliacao: "certo" | "errado", correcao?: string) => Promise<boolean>;
};

export function ItemAprendizado({ item, salvando, aoAvaliar }: ItemAprendizadoProps) {
  const [corrigindo, setCorrigindo] = useState(false);
  const [correcao, setCorrecao] = useState(item.correcao ?? "");

  async function confirmar() {
    if (await aoAvaliar(item, "certo")) setCorrigindo(false);
  }

  async function negar() {
    if (await aoAvaliar(item, "errado", correcao.trim() || undefined)) setCorrigindo(false);
  }

  return (
    <li className="flex flex-col gap-2 py-2.5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <p
          className={cn(
            "min-w-0 flex-1 text-sm",
            item.avaliacao === "errado" && "text-texto-secundario line-through",
          )}
        >
          {item.texto}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={salvando}
            aria-pressed={item.avaliacao === "certo"}
            onClick={confirmar}
            className={cn(
              "h-7 px-2 text-xs text-texto-secundario",
              item.avaliacao === "certo" && "bg-sucesso-fundo text-sucesso",
            )}
          >
            <Check aria-hidden />
            Está certo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={salvando}
            aria-pressed={item.avaliacao === "errado"}
            onClick={() => setCorrigindo(true)}
            className={cn(
              "h-7 px-2 text-xs text-texto-secundario",
              item.avaliacao === "errado" && "bg-erro-fundo text-erro",
            )}
          >
            <X aria-hidden />
            Não sou assim
          </Button>
        </div>
      </div>
      {item.avaliacao === "errado" && item.correcao && !corrigindo && (
        <p className="text-xs text-texto-secundario">Sua correção: {item.correcao}</p>
      )}
      {corrigindo && (
        <div className="flex flex-col gap-2 rounded-md border bg-card p-3">
          <label htmlFor={`correcao-${item.id}`} className="text-xs font-medium">
            Como você faz? <span className="font-normal text-texto-secundario">(opcional)</span>
          </label>
          <textarea
            id={`correcao-${item.id}`}
            value={correcao}
            onChange={(evento) => setCorrecao(evento.target.value)}
            maxLength={500}
            rows={2}
            className="w-full resize-y rounded-md border bg-background p-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCorrigindo(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button size="sm" onClick={negar} disabled={salvando}>
              Salvar
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
