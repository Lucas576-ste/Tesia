"use client";

import { fasesDoRito } from "@tesia/shared";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { corrigirFase, encerrarProcesso } from "@/app/app/clientes/acoes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";

type AcoesFaseProps = {
  processoId: string;
  rito: string | null;
  fase: string | null;
  encerrado: boolean;
};

export function AcoesFase({ processoId, rito, fase, encerrado }: AcoesFaseProps) {
  const router = useRouter();
  const [salvando, iniciar] = useTransition();

  function executar(acao: () => Promise<{ ok: true } | { erro: string }>, mensagem: string) {
    iniciar(async () => {
      const resultado = await acao();
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      toast.success(mensagem);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      {!encerrado && (
        <div className="flex flex-col gap-1">
          <Label htmlFor={`fase-${processoId}`} className="text-xs text-texto-secundario">
            Corrigir fase
          </Label>
          <SelectNativo
            id={`fase-${processoId}`}
            value={fase ?? ""}
            disabled={salvando}
            onChange={(evento) =>
              executar(() => corrigirFase(processoId, evento.target.value), "Fase corrigida.")
            }
            className="h-9 w-auto"
          >
            {!fase && <option value="">Escolha a fase</option>}
            {fasesDoRito(rito).map((item) => (
              <option key={item.codigo} value={item.codigo}>
                {item.nome}
              </option>
            ))}
          </SelectNativo>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={salvando}
        onClick={() =>
          executar(
            () => encerrarProcesso(processoId, !encerrado),
            encerrado ? "Processo reaberto." : "Processo encerrado.",
          )
        }
      >
        {encerrado ? "Reabrir processo" : "Marcar como encerrado"}
      </Button>
    </div>
  );
}
