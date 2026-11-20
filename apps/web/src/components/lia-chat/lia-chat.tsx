"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AvatarLia } from "@/components/lia/avatar-lia";
import { cn } from "@/lib/utils";
import { PainelLia } from "./painel-lia";

const RETENCAO_PADRAO = 90;

export function LiaChat({ vencendo }: { vencendo: number }) {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);
  const [jaAbriu, setJaAbriu] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const noEditor = /^\/app\/pecas\/[^/]+$/.test(caminho);
  const retencao = Number(process.env.NEXT_PUBLIC_LIA_RETENCAO_DIAS) || RETENCAO_PADRAO;

  const alternar = useCallback(() => {
    setAberto((atual) => {
      if (atual) botao.current?.focus();
      return !atual;
    });
    setJaAbriu(true);
  }, []);

  const fechar = useCallback(() => {
    setAberto(false);
    botao.current?.focus();
  }, []);

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (
        evento.ctrlKey &&
        !evento.altKey &&
        !evento.shiftKey &&
        evento.key.toLowerCase() === "j"
      ) {
        evento.preventDefault();
        alternar();
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [alternar]);

  return (
    <>
      <div
        className={cn(
          "group fixed right-4 z-40 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-6",
          aberto && "max-md:hidden",
          noEditor && "max-md:hidden",
        )}
      >
        <button
          ref={botao}
          type="button"
          onClick={alternar}
          aria-label="Pergunte à Lia"
          aria-expanded={aberto}
          aria-keyshortcuts="Control+J"
          className="relative flex size-14 items-center justify-center rounded-full border-2 border-destaque bg-card shadow-md outline-none motion-safe:transition-transform hover:scale-105 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <AvatarLia className="size-11 text-xl" />
          {vencendo > 0 && (
            <span
              aria-label={`${vencendo} ${vencendo === 1 ? "prazo vence" : "prazos vencem"} em até 2 dias`}
              className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-erro px-1 text-[11px] font-bold text-white tabular-nums"
            >
              {vencendo > 9 ? "9+" : vencendo}
            </span>
          )}
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute top-1/2 right-full mr-2 -translate-y-1/2 rounded-md bg-menu px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-md group-focus-within:opacity-100 group-hover:opacity-100 max-md:hidden"
        >
          Pergunte à Lia <kbd className="ml-1 text-white/70">Ctrl+J</kbd>
        </span>
      </div>
      {jaAbriu && (
        <PainelLia
          aberto={aberto}
          rota={caminho}
          vencendo={vencendo}
          retencaoDias={retencao}
          aoFechar={fechar}
          painelRef={painel}
        />
      )}
    </>
  );
}
