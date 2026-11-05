"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const passos = [
  { rotulo: "Seus dados", href: "/onboarding/perfil" },
  { rotulo: "Seu estilo", href: "/onboarding/estilo" },
  { rotulo: "Seu modelo", href: "/onboarding/modelo" },
];

export function BarraProgresso() {
  const caminho = usePathname();
  const atual = passos.findIndex(({ href }) => href === caminho);

  return (
    <nav aria-label="Passos do primeiro acesso">
      <ol className="grid grid-cols-3 gap-2">
        {passos.map(({ rotulo, href }, indice) => {
          const concluido = indice < atual;
          const ativo = indice === atual;
          const conteudo = (
            <>
              <span
                className={cn("h-1.5 rounded-full bg-borda", (concluido || ativo) && "bg-primaria")}
              />
              <span className="flex items-center gap-1 text-xs font-medium">
                {concluido && <Check aria-hidden className="size-3.5 text-sucesso" />}
                <span className="tabular-nums">{indice + 1}.</span> {rotulo}
              </span>
            </>
          );

          return (
            <li key={href}>
              {concluido ? (
                <Link href={href} className="flex flex-col gap-1.5 py-1 hover:underline">
                  {conteudo}
                </Link>
              ) : (
                <span
                  aria-current={ativo ? "step" : undefined}
                  className={cn("flex flex-col gap-1.5 py-1", !ativo && "text-texto-secundario")}
                >
                  {conteudo}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
