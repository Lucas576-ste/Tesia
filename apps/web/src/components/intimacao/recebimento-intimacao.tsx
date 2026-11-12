"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROTULOS_FORMA, type FormaRecebimento, type Recebimento } from "@/lib/recalculo-prazo";

type RecebimentoIntimacaoProps = {
  recebimento: Recebimento;
  bloqueado: boolean;
  aoMudar: (recebimento: Recebimento) => void;
};

export function RecebimentoIntimacao({
  recebimento,
  bloqueado,
  aoMudar,
}: RecebimentoIntimacaoProps) {
  function mudar(campo: keyof Recebimento, valor: string) {
    aoMudar({ ...recebimento, [campo]: valor });
  }

  return (
    <fieldset disabled={bloqueado} className="flex flex-col gap-3 rounded-md border p-3">
      <legend className="px-1 text-sm font-medium">Como a intimação chegou</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(ROTULOS_FORMA) as FormaRecebimento[]).map((forma) => (
          <label
            key={forma}
            className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-checked:border-primaria has-checked:bg-primaria-fundo"
          >
            <input
              type="radio"
              name="forma-recebimento"
              value={forma}
              checked={recebimento.forma === forma}
              onChange={() => mudar("forma", forma)}
              className="accent-primaria"
            />
            {ROTULOS_FORMA[forma]}
          </label>
        ))}
      </div>
      {recebimento.forma === "diario" && (
        <div className="flex flex-col gap-1.5 sm:max-w-56">
          <Label htmlFor="data-disponibilizacao">Disponibilizada no diário em</Label>
          <Input
            id="data-disponibilizacao"
            type="date"
            value={recebimento.disponibilizacao}
            onChange={(evento) => mudar("disponibilizacao", evento.target.value)}
          />
        </div>
      )}
      {recebimento.forma === "portal" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data-envio">Enviada no portal em</Label>
            <Input
              id="data-envio"
              type="date"
              value={recebimento.envio}
              onChange={(evento) => mudar("envio", evento.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data-abertura">Abri a intimação em</Label>
            <Input
              id="data-abertura"
              type="date"
              value={recebimento.abertura}
              min={recebimento.envio || undefined}
              onChange={(evento) => mudar("abertura", evento.target.value)}
            />
          </div>
          <p className="text-xs text-texto-secundario sm:col-span-2">
            Se você não abriu, a ciência acontece sozinha 10 dias corridos depois do envio. Deixe em
            branco nesse caso.
          </p>
        </div>
      )}
      {recebimento.forma === "citacao" && (
        <p className="text-sm text-texto-secundario">
          Na citação, o prazo começa conforme a forma (correio, oficial de justiça ou meio
          eletrônico). Informe o prazo fatal abaixo.
        </p>
      )}
    </fieldset>
  );
}
