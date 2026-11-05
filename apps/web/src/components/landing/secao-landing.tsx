import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Revelar } from "./revelar";

const fundos = {
  claro: "bg-fundo",
  branco: "bg-card",
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
    <section id={id} className={cn("scroll-mt-14", fundos[fundo])}>
      <Revelar className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-12 md:py-16">
        {titulo && <h2 className="text-3xl font-semibold md:text-4xl">{titulo}</h2>}
        {children}
      </Revelar>
    </section>
  );
}
