import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AjudaFlutuante } from "@/components/layout/ajuda-flutuante";
import { BarraSuperior } from "@/components/layout/barra-superior";
import { MenuInferior } from "@/components/layout/menu-inferior";
import { MenuLateral } from "@/components/layout/menu-lateral";
import { AvisoLimite } from "@/components/plano/aviso-limite";
import { ProvedorPlano } from "@/components/plano/provedor-plano";
import { Toaster } from "@/components/ui/sonner";
import { contadoresMenu } from "@/lib/contadores-menu";
import { lerPlano } from "@/lib/plano-servidor";
import { exigirUsuario, rotuloOab } from "@/lib/sessao";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const usuario = await exigirUsuario();
  if (!usuario.oab_numero) redirect("/onboarding/perfil");
  const [estado, contadores] = await Promise.all([lerPlano(), contadoresMenu()]);

  return (
    <ProvedorPlano estado={estado}>
      <div className="flex min-h-dvh">
        <MenuLateral
          conta={{ nome: usuario.nome, oab: rotuloOab(usuario) }}
          contadores={contadores}
          uso={{ ...estado.uso, plano: estado.plano.nome }}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <BarraSuperior />
          <AvisoLimite {...estado.uso} />
          <main className="flex-1 px-4 pt-4 pb-32 md:px-6 md:pb-16">{children}</main>
        </div>
        <MenuInferior />
        <AjudaFlutuante />
        <Toaster />
      </div>
    </ProvedorPlano>
  );
}
