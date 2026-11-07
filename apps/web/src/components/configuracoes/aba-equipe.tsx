"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import { divisaoAreasExemplo, membrosEquipeExemplo } from "@/lib/planos-exemplo";

export function AbaEquipe() {
  const [divisao, setDivisao] = useState(divisaoAreasExemplo);

  return (
    <Card className="flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-2">
        <ul className="rounded-md border">
          {membrosEquipeExemplo.map(({ id, nome, papel }) => (
            <li key={id} className="flex items-center gap-2 border-b p-2 text-sm last:border-b-0">
              <span className="min-w-0 flex-1 font-medium">{nome}</span>
              <Badge variant="secondary">{papel}</Badge>
            </li>
          ))}
        </ul>
        <p className="text-xs text-texto-secundario">
          O plano inclui 2 advogados, cada um com login e OAB próprios.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">Divisão por área</h2>
          <p className="text-sm text-texto-secundario">
            Cada intimação nova chega com o responsável sugerido, e vocês podem trocar.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(divisao).map(([area, responsavel]) => (
            <div key={area} className="flex flex-col gap-1.5">
              <Label htmlFor={`divisao-${area}`}>{area}</Label>
              <SelectNativo
                id={`divisao-${area}`}
                value={responsavel}
                onChange={(evento) =>
                  setDivisao((atual) => ({ ...atual, [area]: evento.target.value }))
                }
              >
                <option value="">Sem responsável</option>
                {membrosEquipeExemplo.map(({ id, nome }) => (
                  <option key={id} value={nome}>
                    {nome}
                  </option>
                ))}
              </SelectNativo>
            </div>
          ))}
        </div>
      </div>
      <Button
        className="w-full sm:w-auto sm:self-end"
        onClick={() => toast.success("Divisão salva neste exemplo. Nada foi enviado.")}
      >
        Salvar
      </Button>
    </Card>
  );
}
