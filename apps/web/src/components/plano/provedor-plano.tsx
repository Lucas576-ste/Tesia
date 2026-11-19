"use client";

import { createContext, use, type ReactNode } from "react";
import { estadoPadrao, type EstadoPlano } from "@/lib/plano";

const ContextoPlano = createContext<EstadoPlano>(estadoPadrao());

type ProvedorPlanoProps = {
  estado: EstadoPlano;
  children: ReactNode;
};

export function ProvedorPlano({ estado, children }: ProvedorPlanoProps) {
  return <ContextoPlano value={estado}>{children}</ContextoPlano>;
}

export function usePlano() {
  return use(ContextoPlano);
}
