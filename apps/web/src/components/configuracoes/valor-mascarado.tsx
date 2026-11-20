"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const OCULTAR_APOS_MS = 30_000;

type ValorMascaradoProps = { rotulo: string; real: string; mascarado: string };

export function ValorMascarado({ rotulo, real, mascarado }: ValorMascaradoProps) {
  const [revelado, setRevelado] = useState(false);

  useEffect(() => {
    if (!revelado) return;
    const temporizador = setTimeout(() => setRevelado(false), OCULTAR_APOS_MS);
    return () => clearTimeout(temporizador);
  }, [revelado]);

  if (!real) return <span className="font-normal text-texto-secundario">Não informado</span>;

  return (
    <span className="inline-flex items-center gap-1">
      <span className="tabular-nums">{revelado ? real : mascarado}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-pressed={revelado}
        aria-label={revelado ? `Ocultar ${rotulo}` : `Mostrar ${rotulo}`}
        title={revelado ? "Ocultar" : "Mostrar"}
        onClick={() => setRevelado((atual) => !atual)}
      >
        {revelado ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
      </Button>
    </span>
  );
}
