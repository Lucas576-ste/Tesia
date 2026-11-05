import type { ReactNode } from "react";
import { BarraSuperior } from "@/components/layout/barra-superior";
import { prazosExemplo } from "@/components/layout/dados-exemplo";
import { FaixaAlertaPrazo } from "@/components/layout/faixa-alerta-prazo";
import { MenuInferior } from "@/components/layout/menu-inferior";
import { MenuLateral } from "@/components/layout/menu-lateral";
import { Toaster } from "@/components/ui/sonner";
import { prazoCritico } from "@/lib/prazo";

export default function AppLayout({ children }: { children: ReactNode }) {
  const critico = prazoCritico(prazosExemplo);

  return (
    <div className="flex min-h-dvh">
      <MenuLateral />
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperior />
        {critico && <FaixaAlertaPrazo {...critico} />}
        <main className="flex-1 px-4 pt-4 pb-24 md:px-6 md:pb-4">{children}</main>
      </div>
      <MenuInferior />
      <Toaster />
    </div>
  );
}
