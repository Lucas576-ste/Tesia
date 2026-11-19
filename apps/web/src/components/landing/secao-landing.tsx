import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Revelar } from "./revelar";
import { HaloMouse } from "./halo-mouse";

const fundos = {
  claro: "bg-fundo",
  branco: "bg-secao",
  escuro: "bg-menu text-white",
};

type SecaoLandingProps = {
  id?: string;
  fundo?: keyof typeof fundos;
  titulo?: ReactNode;
  children: ReactNode;
};

export function SecaoLanding({ id, fundo = "claro", titulo, children }: SecaoLandingProps) {
  return (
    <section id={id} className={cn("relative scroll-mt-14 overflow-hidden", fundos[fundo])}>
      {fundo === "escuro" ? (
        <HaloMouse />
      ) : (
        <div aria-hidden className="textura-pauta pointer-events-none absolute inset-0" />
      )}
      <Revelar className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-12 md:py-16">
        {titulo && (
          <div className="flex flex-col gap-3">
            <h2
              className={cn(
                "text-3xl font-semibold md:text-4xl",
                fundo !== "escuro" && "text-titulo",
              )}
            >
              {titulo}
            </h2>
            <span aria-hidden className="h-1 w-12 rounded-full bg-destaque" />
          </div>
        )}
        {children}
      </Revelar>
    </section>
  );
}
