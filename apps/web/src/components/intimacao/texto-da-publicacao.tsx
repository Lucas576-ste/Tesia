"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { chaveDoGrifo, type Grifo, type TrechoDocumento } from "@/lib/formatar-publicacao";
import { cn } from "@/lib/utils";
import { BlocoGrifado } from "./bloco-grifado";

type TextoDaPublicacaoProps = {
  blocos: TrechoDocumento[];
  textoOriginal: string;
  destaque?: Grifo[];
  vazio: string;
};

export function TextoDaPublicacao({
  blocos,
  textoOriginal,
  destaque = [],
  vazio,
}: TextoDaPublicacaoProps) {
  const grifo = chaveDoGrifo(destaque);
  const [pedido, setPedido] = useState<string | null>(null);
  const comoChegou = pedido === grifo;

  return (
    <section aria-label="Documento original" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Documento original</h2>
        {blocos.length > 0 && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => setPedido(comoChegou ? null : grifo)}
          >
            {comoChegou ? "Ver formatado" : "Ver como chegou"}
          </Button>
        )}
      </div>
      {blocos.length > 0 && !comoChegou && (
        <p className="text-xs text-texto-secundario">
          Parágrafos organizados pela Tesia para facilitar a leitura. O texto não foi alterado.
        </p>
      )}
      <div className="tema-claro flex flex-col gap-4 rounded-md border bg-card p-5 text-sm leading-relaxed break-words shadow-xs">
        {blocos.length === 0 && <p className="text-texto-secundario">{vazio}</p>}
        {comoChegou ? (
          <p className="whitespace-pre-line">{textoOriginal}</p>
        ) : (
          blocos.map(({ id, texto, titulo }) => (
            <p
              key={id}
              id={`trecho-${id}`}
              className={cn("scroll-mt-20", titulo && "font-semibold")}
            >
              <BlocoGrifado texto={texto} grifo={destaque.find((item) => item.id === id)} />
            </p>
          ))
        )}
      </div>
    </section>
  );
}
