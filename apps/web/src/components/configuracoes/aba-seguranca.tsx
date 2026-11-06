"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sessoesExemplo } from "@/lib/conta-exemplo";

export function AbaSeguranca() {
  const [sessoes, setSessoes] = useState(sessoesExemplo);

  return (
    <Card className="flex flex-col gap-5 p-4">
      <section className="flex flex-col items-start gap-2">
        <h2 className="text-base font-semibold">Senha</h2>
        <p className="text-sm text-texto-secundario">
          Você recebe um link por e-mail para criar uma nova senha.
        </p>
        <Button
          variant="outline"
          onClick={() => toast.info("O login ainda não está ligado. Nenhum e-mail foi enviado.")}
        >
          Alterar senha
        </Button>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Sessões ativas</h2>
        <ul className="rounded-md border">
          {sessoes.map(({ id, dispositivo, local, atual }) => (
            <li
              key={id}
              className="flex flex-wrap items-center gap-2 border-b p-2 text-sm last:border-b-0"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{dispositivo}</span>
                <span className="text-xs text-texto-secundario">{local}</span>
              </span>
              {atual ? (
                <Badge variant="secondary">Esta sessão</Badge>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSessoes((atuais) => atuais.filter((item) => item.id !== id))}
                >
                  Encerrar
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </Card>
  );
}
