"use client";

import { Plus } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NIVEIS_ESTILO, nivelEstilo, proximaAcaoEstilo } from "@tesia/shared";
import { ACEITOS_PECA_ESTILO } from "@/lib/estilo";
import { dataCurta } from "@/lib/data-br";
import { cn } from "@/lib/utils";

type CardStatusEstiloProps = {
  lidas: number;
  cheio: boolean;
  novidades: { pecas: number; correcoes: number };
  atualizadoEm: string | null;
  atualizando: boolean;
  pedindo: boolean;
  aoAdicionar: (arquivos: File[]) => void;
  aoAtualizar: () => void;
};

function textoNovidades({ pecas, correcoes }: { pecas: number; correcoes: number }) {
  const partes = [
    pecas > 0 ? `${pecas} ${pecas === 1 ? "peça nova" : "peças novas"}` : null,
    correcoes > 0 ? `${correcoes} ${correcoes === 1 ? "correção" : "correções"}` : null,
  ].filter(Boolean);
  return `${partes.join(" e ")} desde a última análise`;
}

function Medidor({ indice, rotulo }: { indice: number; rotulo: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-3 gap-1.5" role="img" aria-label={`Nível ${rotulo}`}>
        {NIVEIS_ESTILO.map(({ codigo }, posicao) => {
          const nivel = posicao + 1;
          return (
            <span
              key={codigo}
              className={cn(
                "h-2.5 rounded-full",
                nivel === indice
                  ? "bg-(image:--dourado)"
                  : nivel < indice
                    ? "bg-primaria/40"
                    : "bg-muted",
              )}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-xs">
        {NIVEIS_ESTILO.map(({ codigo, rotulo }, posicao) => (
          <span
            key={codigo}
            className={cn(
              "text-texto-secundario",
              posicao + 1 === indice && "font-semibold text-titulo",
            )}
          >
            {rotulo}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CardStatusEstilo({
  lidas,
  cheio,
  novidades,
  atualizadoEm,
  atualizando,
  pedindo,
  aoAdicionar,
  aoAtualizar,
}: CardStatusEstiloProps) {
  const seletor = useRef<HTMLInputElement>(null);
  const nivel = nivelEstilo(lidas);
  const temNovidade = novidades.pecas + novidades.correcoes > 0;

  return (
    <Card className="gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-medium text-texto-secundario">Nível do seu estilo</p>
          <h2 className="text-2xl font-semibold text-titulo">{nivel.rotulo}</h2>
        </div>
        <Button variant="outline" disabled={cheio} onClick={() => seletor.current?.click()}>
          <Plus aria-hidden />
          Adicionar peças
        </Button>
        <input
          ref={seletor}
          type="file"
          multiple
          accept={ACEITOS_PECA_ESTILO}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(evento) => {
            aoAdicionar(Array.from(evento.target.files ?? []));
            evento.target.value = "";
          }}
        />
      </div>
      <Medidor indice={nivel.indice} rotulo={nivel.rotulo} />
      <p className="text-sm">{proximaAcaoEstilo(lidas)}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-3 text-sm">
        {temNovidade && !atualizando ? (
          <>
            <span className="text-texto-secundario">{textoNovidades(novidades)} ·</span>
            <Button size="sm" onClick={aoAtualizar} disabled={pedindo}>
              Atualizar meu estilo
            </Button>
          </>
        ) : atualizando ? (
          <span role="status" className="text-texto-secundario">
            Atualizando o seu estilo…
          </span>
        ) : atualizadoEm ? (
          <span className="text-texto-secundario">
            Estilo atualizado em {dataCurta(atualizadoEm)}
          </span>
        ) : (
          <span className="text-texto-secundario">
            Assim que as peças forem lidas, o estilo é montado.
          </span>
        )}
      </div>
    </Card>
  );
}
