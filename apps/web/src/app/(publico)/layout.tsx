import type { ReactNode } from "react";
import { CabecalhoLanding } from "@/components/landing/cabecalho-landing";
import { RodapeLanding } from "@/components/landing/rodape-landing";

export default function PublicoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <CabecalhoLanding />
      <main className="flex-1">{children}</main>
      <RodapeLanding />
    </div>
  );
}
