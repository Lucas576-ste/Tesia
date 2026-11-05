"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { track, type EventoMedicao } from "@/lib/medicao";

type BotaoRastreadoProps = Omit<ComponentProps<typeof Button>, "asChild"> & {
  href: string;
  evento: EventoMedicao;
};

export function BotaoRastreado({ href, evento, children, ...props }: BotaoRastreadoProps) {
  return (
    <Button asChild {...props}>
      <a href={href} onClick={() => track(evento)}>
        {children}
      </a>
    </Button>
  );
}
