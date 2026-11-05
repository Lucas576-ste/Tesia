"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const temas = {
  light: { rotulo: "Claro", icone: Sun, proximo: "dark" },
  dark: { rotulo: "Escuro", icone: Moon, proximo: "system" },
  system: { rotulo: "Sistema", icone: Monitor, proximo: "light" },
} as const;

type Tema = keyof typeof temas;

function inscrever() {
  return () => {};
}

export function SeletorTema() {
  const montado = useSyncExternalStore(
    inscrever,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();
  const atual: Tema = montado && theme && theme in temas ? (theme as Tema) : "system";
  const { rotulo, icone: Icone, proximo } = temas[atual];
  const descricao = `Tema: ${rotulo}. Trocar para ${temas[proximo].rotulo}`;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={descricao}
      title={descricao}
      onClick={() => setTheme(proximo)}
    >
      <Icone aria-hidden />
    </Button>
  );
}
