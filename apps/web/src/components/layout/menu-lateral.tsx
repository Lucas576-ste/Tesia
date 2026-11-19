"use client";

import { ChevronsLeft, ChevronsRight, CreditCard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { sair } from "@/app/(autenticacao)/acoes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  itemConfiguracoes,
  itemEstaAtivo,
  itemIndicar,
  itensMenu,
  type ItemMenu,
} from "./itens-menu";
import { SimboloTesia } from "./simbolo-tesia";

const CHAVE_RECOLHIDO = "tesia-menu-recolhido";

type MenuLateralProps = {
  conta: { nome: string; oab: string };
  contadores: { intimacoes: number; rascunhos: number };
  uso: { usadas: number; limite: number; plano: string };
};

function LinkMenu({
  item,
  ativo,
  recolhido,
  contador = 0,
}: {
  item: ItemMenu;
  ativo: boolean;
  recolhido: boolean;
  contador?: number;
}) {
  const Icone = item.icone;
  const rotulo = contador ? `${item.rotulo} (${contador})` : item.rotulo;
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      aria-label={recolhido ? rotulo : undefined}
      title={recolhido ? rotulo : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-md py-2 text-sm text-menu-texto transition-colors outline-none hover:bg-menu-ativo hover:text-white focus-visible:ring-2 focus-visible:ring-white/70",
        recolhido ? "justify-center px-0" : "px-3",
        ativo &&
          "bg-menu-ativo font-medium text-white before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-destaque",
      )}
    >
      <Icone aria-hidden className="size-4 shrink-0" />
      {!recolhido && <span className="flex-1 truncate">{item.rotulo}</span>}
      {contador > 0 &&
        (recolhido ? (
          <span aria-hidden className="absolute top-1 right-2 size-2 rounded-full bg-destaque" />
        ) : (
          <span className="rounded-full bg-destaque px-1.5 text-[11px] font-bold text-menu tabular-nums">
            {contador}
          </span>
        ))}
    </Link>
  );
}

function assinarRecolhido(aoMudar: () => void) {
  window.addEventListener(CHAVE_RECOLHIDO, aoMudar);
  window.addEventListener("storage", aoMudar);
  return () => {
    window.removeEventListener(CHAVE_RECOLHIDO, aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}

function lerRecolhido() {
  try {
    return localStorage.getItem(CHAVE_RECOLHIDO) === "1";
  } catch {
    return false;
  }
}

export function MenuLateral({ conta, contadores, uso }: MenuLateralProps) {
  const caminho = usePathname();
  const recolhido = useSyncExternalStore(assinarRecolhido, lerRecolhido, () => false);
  const percentual =
    uso.limite > 0 ? Math.min(100, Math.round((uso.usadas / uso.limite) * 100)) : 0;

  function alternar() {
    try {
      localStorage.setItem(CHAVE_RECOLHIDO, recolhido ? "0" : "1");
    } catch {
      return;
    }
    window.dispatchEvent(new Event(CHAVE_RECOLHIDO));
  }

  return (
    <aside
      data-recolhido={recolhido || undefined}
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col bg-menu text-white transition-[width] duration-200 md:flex",
        recolhido ? "w-[68px]" : "w-[232px]",
      )}
    >
      <div
        className={cn(
          "flex items-center py-4",
          recolhido ? "flex-col gap-2 px-2" : "justify-between pr-2 pl-5",
        )}
      >
        <Link
          href="/app"
          aria-label="Tesia, ir ao painel"
          className="flex items-center gap-2 text-xl font-semibold"
        >
          <SimboloTesia />
          {!recolhido && "Tesia"}
        </Link>
        <button
          type="button"
          onClick={alternar}
          aria-label={recolhido ? "Expandir menu" : "Recolher menu"}
          title={recolhido ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!recolhido}
          className="flex size-8 items-center justify-center rounded-md text-menu-texto outline-none hover:bg-menu-ativo hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {recolhido ? (
            <ChevronsRight aria-hidden className="size-4" />
          ) : (
            <ChevronsLeft aria-hidden className="size-4" />
          )}
        </button>
      </div>
      <nav aria-label="Menu principal" className="flex flex-1 flex-col gap-1 px-3">
        {itensMenu.map((item) => (
          <LinkMenu
            key={item.href}
            item={item}
            ativo={itemEstaAtivo(item.href, caminho)}
            recolhido={recolhido}
            contador={item.contador ? contadores[item.contador] : 0}
          />
        ))}
        <div className="mt-auto flex flex-col gap-1 pb-2">
          <LinkMenu
            item={itemConfiguracoes}
            ativo={itemEstaAtivo(itemConfiguracoes.href, caminho)}
            recolhido={recolhido}
          />
          <LinkMenu
            item={itemIndicar}
            ativo={itemEstaAtivo(itemIndicar.href, caminho)}
            recolhido={recolhido}
          />
        </div>
      </nav>
      {!recolhido && (
        <Link
          href="/app/plano"
          className="mx-3 mb-2 flex flex-col gap-1.5 rounded-lg bg-menu-ativo/70 px-3 py-2.5 text-xs outline-none hover:bg-menu-ativo focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="font-medium text-white tabular-nums">
              Peças hoje: {uso.usadas} de {uso.limite}
            </span>
            <span className="truncate text-menu-texto">{uso.plano}</span>
          </span>
          <span className="h-1 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-(image:--dourado)"
              style={{ width: `${percentual}%` }}
            />
          </span>
        </Link>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title={`${conta.nome} · ${conta.oab}`}
            className={cn(
              "flex items-center gap-2 border-t border-menu-ativo py-3 text-left outline-none hover:bg-menu-ativo focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset",
              recolhido ? "justify-center px-0" : "px-5",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(image:--dourado) text-sm font-bold text-menu">
              {conta.nome.trim().charAt(0).toUpperCase()}
            </span>
            {!recolhido && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{conta.nome}</span>
                <span className="block truncate text-xs text-menu-texto">{conta.oab}</span>
              </span>
            )}
            <span className="sr-only">Abrir menu da conta</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/app/configuracoes">
              <Settings aria-hidden />
              Configurações
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/app/plano">
              <CreditCard aria-hidden />
              Plano e uso
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={sair}>
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full">
                <LogOut aria-hidden />
                Sair
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}
