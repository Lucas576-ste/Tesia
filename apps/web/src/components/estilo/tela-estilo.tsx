"use client";

import { FileText, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EstadoVazio } from "@/components/estado-vazio";
import { PainelAprendizado } from "@/components/onboarding/painel-aprendizado";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ZonaUpload } from "@/components/zona-upload";
import {
  ACEITOS_PECA_ESTILO,
  MAXIMO_PECAS_ESTILO,
  MINIMO_PECAS_ESTILO,
  type PecaEstilo,
} from "@/lib/estilo";
import { StatusPeca } from "./status-peca";
import { usePecasEstilo } from "./usar-pecas-estilo";

type TelaEstiloProps = {
  escritorioId: string;
  usuarioId: string;
  pecasIniciais: PecaEstilo[];
};

export function TelaEstilo({ escritorioId, usuarioId, pecasIniciais }: TelaEstiloProps) {
  const { pecas, adicionar, remover, lidas, validas } = usePecasEstilo(
    escritorioId,
    usuarioId,
    pecasIniciais,
  );
  const [usarRevisadas, setUsarRevisadas] = useState(true);

  return (
    <div className="grid items-start gap-4 md:grid-cols-[1fr_20rem]">
      <div className="flex flex-col gap-4">
        <ZonaUpload
          titulo="Adicionar peças"
          descricao={`De ${MINIMO_PECAS_ESTILO} a ${MAXIMO_PECAS_ESTILO} peças em PDF ou Word (.docx)`}
          accept={ACEITOS_PECA_ESTILO}
          aoEscolher={adicionar}
        />
        {validas < MINIMO_PECAS_ESTILO && (
          <p role="status" className="rounded-md bg-atencao-fundo px-3 py-2 text-sm text-atencao">
            Com menos de {MINIMO_PECAS_ESTILO} peças, o rascunho fica mais genérico.
          </p>
        )}
        <p className="text-sm font-medium tabular-nums">
          {lidas} {lidas === 1 ? "peça lida" : "peças lidas"} de {MAXIMO_PECAS_ESTILO}
        </p>
        {pecas.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma peça enviada"
            descricao="Adicione suas peças para a Lia aprender o seu estilo."
          />
        ) : (
          <Card className="gap-0 py-0">
            <ul aria-live="polite">
              {pecas.map((peca) => (
                <li
                  key={peca.id}
                  className="flex flex-wrap items-center gap-2 border-b p-3 text-sm last:border-b-0"
                >
                  <FileText aria-hidden className="size-4 shrink-0 text-texto-secundario" />
                  <span className="min-w-0 flex-1 break-all">{peca.nome}</span>
                  <StatusPeca peca={peca} />
                  <span className="hidden text-xs text-texto-secundario tabular-nums sm:inline">
                    {peca.data}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remover ${peca.nome}`}
                    onClick={() => void remover(peca.id)}
                  >
                    <X aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <PainelAprendizado />
        <Button
          disabled={lidas === 0}
          onClick={() => toast.info("O perfil de estilo é montado a partir do próximo passo.")}
        >
          Atualizar meu estilo
        </Button>
        <label className="flex cursor-pointer items-start gap-2 rounded-md border bg-card p-3 text-sm has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50">
          <input
            type="checkbox"
            checked={usarRevisadas}
            onChange={(evento) => setUsarRevisadas(evento.target.checked)}
            className="mt-0.5 accent-primaria"
          />
          Usar as peças que eu revisar na Tesia para melhorar o meu estilo
        </label>
      </div>
    </div>
  );
}
