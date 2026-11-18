"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { BotaoSair } from "@/components/autenticacao/botao-sair";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { itemConfiguracoes, itemEstaAtivo, itemIndicar, itensMenu } from "./itens-menu";
import { SimboloTesia } from "./simbolo-tesia";

type MenuLateralProps = {
  conta: { nome: string; oab: string };
};

export function MenuLateral({ conta }: MenuLateralProps) {
  const caminho = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col bg-menu text-white md:flex">
      <Link
        href="/app"
        className="flex items-center gap-2 px-5 py-5 font-serif text-xl font-semibold"
      >
        <SimboloTesia />
        Tesia
      </Link>
      <nav aria-label="Menu principal" className="flex flex-1 flex-col gap-1 px-3">
        {[...itensMenu, itemIndicar, itemConfiguracoes].map(({ rotulo, href, icone: Icone }) => {
          const ativo = itemEstaAtivo(href, caminho);
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm text-menu-texto transition-colors outline-none hover:bg-menu-ativo hover:text-white focus-visible:ring-2 focus-visible:ring-white/70",
                ativo &&
                  "bg-menu-ativo font-medium text-white before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-destaque",
              )}
            >
              <Icone aria-hidden className="size-4 shrink-0" />
              <span>{rotulo}</span>
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center border-t border-menu-ativo">
        <Link
          href="/app/configuracoes"
          className="flex min-w-0 flex-1 items-center gap-2 py-4 pr-2 pl-5 transition-colors outline-none hover:bg-menu-ativo focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{conta.nome}</span>
            <span className="block truncate text-xs text-menu-texto">{conta.oab}</span>
          </span>
          <ChevronRight aria-hidden className="size-4 shrink-0 text-menu-texto" />
          <span className="sr-only">Abrir conta</span>
        </Link>
        <BotaoSair
          variante="icone"
          className="pr-3 [&_button]:text-menu-texto [&_button]:hover:bg-menu-ativo [&_button]:hover:text-white"
        />
      </div>
    </aside>
  );
}
