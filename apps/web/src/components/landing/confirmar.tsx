import type { ReactNode } from "react";

export const mostrarConfirmar = process.env.NODE_ENV === "development";

type ConfirmarProps = {
  motivo: string;
  alternativa?: ReactNode;
  children: ReactNode;
};

export function Confirmar({ motivo, alternativa = null, children }: ConfirmarProps) {
  if (!mostrarConfirmar) return <>{alternativa}</>;

  return (
    <span data-confirmar className="rounded-sm bg-amber-200 px-1 text-menu">
      {children} <span className="text-xs font-normal">[CONFIRMAR: {motivo}]</span>
    </span>
  );
}
