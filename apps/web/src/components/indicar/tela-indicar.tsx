"use client";

import { Copy, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  indicacoesExemplo,
  LINK_INDICACAO_EXEMPLO,
  MESES_GRATIS_EXEMPLO,
} from "@/lib/conta-exemplo";
import { copiarTexto } from "@/lib/copiar";

const textoWhatsapp = encodeURIComponent(
  `Estou usando a Tesia para acompanhar prazos e preparar rascunhos de peças. Conheça: ${LINK_INDICACAO_EXEMPLO}`,
);

function Contador({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-2.5 shadow-xs">
      <span className="text-sm text-texto-secundario">{rotulo}</span>
      <span className="font-serif text-2xl font-semibold tabular-nums">{valor}</span>
    </div>
  );
}

export function TelaIndicar() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="link-indicacao">Seu link de indicação (exemplo)</Label>
          <Input id="link-indicacao" readOnly value={LINK_INDICACAO_EXEMPLO} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => copiarTexto(LINK_INDICACAO_EXEMPLO, "Link de indicação copiado.")}>
            <Copy aria-hidden />
            Copiar link
          </Button>
          <Button asChild variant="outline">
            <a href={`https://wa.me/?text=${textoWhatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden />
              Compartilhar no WhatsApp
            </a>
          </Button>
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <Contador rotulo="Indicações feitas" valor={indicacoesExemplo.length} />
        <Contador rotulo="Meses grátis ganhos" valor={MESES_GRATIS_EXEMPLO} />
      </div>
      <Card className="gap-0 py-0">
        <ul>
          {indicacoesExemplo.map(({ id, nome, data, status }) => (
            <li
              key={id}
              className="flex flex-wrap items-center gap-2 border-b p-3 text-sm last:border-b-0"
            >
              <span className="min-w-0 flex-1 font-medium">{nome}</span>
              <span className="text-xs text-texto-secundario tabular-nums">{data}</span>
              <Badge variant="secondary">{status}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
