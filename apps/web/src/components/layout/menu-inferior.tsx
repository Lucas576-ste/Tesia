"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { itemEstaAtivo, itensMenu } from "./itens-menu";

export function MenuInferior() {
  const caminho = usePathname();

  return (
    <nav
      aria-label="Menu principal"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 bg-menu pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {itensMenu.map(({ rotulo, rotuloCurto, href, icone: Icone }) => {
        const ativo = itemEstaAtivo(href, caminho);
        return (
          <Link
            key={href}
            href={href}
            aria-label={rotulo}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 px-0.5 py-2 text-[10px] text-menu-texto outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-inset",
              ativo && "bg-menu-ativo font-medium text-white",
            )}
          >
            <Icone aria-hidden className="size-5 shrink-0" />
            <span className="max-w-full truncate">{rotuloCurto}</span>
          </Link>
        );
      })}
    </nav>
  );
}
