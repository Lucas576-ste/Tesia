import type { ReactNode } from "react";
import { BarraSuperior } from "@/components/layout/barra-superior";
import { MenuInferior } from "@/components/layout/menu-inferior";
import { MenuLateral } from "@/components/layout/menu-lateral";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <MenuLateral />
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperior />
        <main className="flex-1 px-4 pt-4 pb-24 md:px-6 md:pb-4">{children}</main>
      </div>
      <MenuInferior />
      <Toaster />
    </div>
  );
}
