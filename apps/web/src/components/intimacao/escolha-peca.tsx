"use client";

import { Badge } from "@/components/ui/badge";
import type { Analise } from "@/lib/analise";

type EscolhaPecaProps = {
  pecas: Analise["pecas"];
  escolhida: string | undefined;
  aoEscolher: (codigo: string) => void;
};

export function EscolhaPeca({ pecas, escolhida, aoEscolher }: EscolhaPecaProps) {
  const recomendada = pecas[0]?.codigo;

  return (
    <fieldset className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
      <legend className="float-left mb-2 font-serif text-lg font-semibold">Peça sugerida</legend>
      {pecas.map(({ codigo, nome, justificativa }) => (
        <label
          key={codigo}
          className="flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm has-checked:border-primaria has-checked:bg-primaria-fundo has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
        >
          <input
            type="radio"
            name="peca"
            checked={escolhida === codigo}
            onChange={() => aoEscolher(codigo)}
            className="mt-0.5 accent-primaria"
          />
          <span>
            <span className="flex flex-wrap items-center gap-2 font-medium">
              {nome}
              {codigo === recomendada && (
                <Badge className="border-transparent bg-destaque text-menu">Recomendada</Badge>
              )}
            </span>
            <span className="text-xs text-texto-secundario">{justificativa}</span>
          </span>
        </label>
      ))}
      {escolhida !== recomendada && (
        <p role="status" className="rounded-md bg-atencao-fundo p-2 text-sm text-atencao">
          Cada peça pode ter outro prazo. O prazo acima foi calculado para a peça recomendada;
          ajuste a data se escolher outra.
        </p>
      )}
    </fieldset>
  );
}
