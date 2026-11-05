import Link from "next/link";
import type { ReactNode } from "react";
import { SimboloTesia } from "@/components/layout/simbolo-tesia";
import { BarraProgresso } from "@/components/onboarding/barra-progresso";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-5 px-4 py-6">
      <Link
        href="/"
        className="flex min-h-9 w-fit items-center gap-2 font-serif text-xl font-semibold"
      >
        <SimboloTesia />
        Tesia
      </Link>
      <BarraProgresso />
      <p className="rounded-md bg-atencao-fundo px-3 py-2 text-xs text-atencao">
        Demonstração: nenhum dado ou arquivo sai do seu navegador.
      </p>
      <main className="flex flex-col gap-5">{children}</main>
    </div>
  );
}
