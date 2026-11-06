"use client";

import { createContext, use, type ReactNode } from "react";
import { montarEstadoPlano, type EstadoPlanoDemo } from "@/lib/planos-exemplo";

const ContextoPlanoDemo = createContext<EstadoPlanoDemo>(montarEstadoPlano());

type ProvedorPlanoDemoProps = {
  estado: EstadoPlanoDemo;
  children: ReactNode;
};

export function ProvedorPlanoDemo({ estado, children }: ProvedorPlanoDemoProps) {
  return <ContextoPlanoDemo value={estado}>{children}</ContextoPlanoDemo>;
}

export function usePlanoDemo() {
  return use(ContextoPlanoDemo);
}
