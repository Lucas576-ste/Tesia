import type { ReactNode } from "react";
import { AjudaFlutuante } from "@/components/layout/ajuda-flutuante";
import { BarraSuperior } from "@/components/layout/barra-superior";
import { MenuInferior } from "@/components/layout/menu-inferior";
import { MenuLateral } from "@/components/layout/menu-lateral";
import { SeletorPlanoDemo } from "@/components/layout/seletor-plano-demo";
import { ProvedorPlanoDemo } from "@/components/plano/provedor-plano-demo";
import { Toaster } from "@/components/ui/sonner";
import { lerPlanoDemo } from "@/lib/plano-demo";
import { mostrarSeletorPlano } from "@/lib/planos-exemplo";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const estado = await lerPlanoDemo();

  return (
    <ProvedorPlanoDemo estado={estado}>
      <div className="flex min-h-dvh">
        <MenuLateral />
        <div className="flex min-w-0 flex-1 flex-col">
          {mostrarSeletorPlano && <SeletorPlanoDemo />}
          <BarraSuperior uso={estado.uso} />
          <main className="flex-1 px-4 pt-4 pb-32 md:px-6 md:pb-16">{children}</main>
        </div>
        <MenuInferior />
        <AjudaFlutuante />
        <Toaster />
      </div>
    </ProvedorPlanoDemo>
  );
}
