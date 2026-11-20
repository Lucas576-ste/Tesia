"use client";

import { PARTES_APRENDIZADO, ROTULOS_PARTE } from "@tesia/shared";
import { Sparkles } from "lucide-react";
import { AvatarLia } from "@/components/lia/avatar-lia";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dataCurta } from "@/lib/data-br";
import type { ItemAprendizado as Item, PerfilPronto } from "@/lib/perfil-estilo";
import { ItemAprendizado } from "./item-aprendizado";

type AprendizadosLiaProps = {
  perfil: PerfilPronto | null;
  atualizando: boolean;
  salvando: boolean;
  aoAvaliar: (item: Item, avaliacao: "certo" | "errado", correcao?: string) => Promise<boolean>;
};

function Carregando() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <p className="text-sm text-texto-secundario">Relendo suas peças…</p>
      {[0, 1, 2].map((grupo) => (
        <div key={grupo} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

function Grupos({
  perfil,
  salvando,
  aoAvaliar,
}: Omit<AprendizadosLiaProps, "atualizando"> & { perfil: PerfilPronto }) {
  const grupos = PARTES_APRENDIZADO.map((parte) =>
    perfil.aprendizados.find((grupo) => grupo.parte === parte),
  ).filter((grupo) => grupo !== undefined && grupo.itens.length > 0);
  if (grupos.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <ul className="flex flex-col gap-2 text-sm">
          {perfil.frases.map((frase) => (
            <li key={frase} className="flex gap-2">
              <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-primaria" />
              {frase}
            </li>
          ))}
        </ul>
        <p className="text-xs text-texto-secundario">
          Atualize o seu estilo para ver o que a Lia aprendeu organizado por parte da peça.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5">
      {grupos.map((grupo) =>
        grupo ? (
          <section key={grupo.parte} aria-label={ROTULOS_PARTE[grupo.parte]}>
            <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-primaria uppercase">
              {ROTULOS_PARTE[grupo.parte]}
            </h3>
            <ul className="divide-y">
              {grupo.itens.map((item) => (
                <ItemAprendizado
                  key={item.id}
                  item={item}
                  salvando={salvando}
                  aoAvaliar={aoAvaliar}
                />
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}

export function AprendizadosLia({
  perfil,
  atualizando,
  salvando,
  aoAvaliar,
}: AprendizadosLiaProps) {
  return (
    <Card aria-label="O que a Lia aprendeu sobre você" className="gap-4 p-5">
      <div className="flex items-center gap-2">
        <AvatarLia />
        <h2 className="text-lg font-semibold text-titulo">O que a Lia aprendeu sobre você</h2>
      </div>
      {atualizando ? (
        <Carregando />
      ) : perfil ? (
        <>
          <Grupos perfil={perfil} salvando={salvando} aoAvaliar={aoAvaliar} />
          <p className="text-xs text-texto-secundario">
            Baseado em {perfil.pecas} {perfil.pecas === 1 ? "peça" : "peças"} suas
            {perfil.atualizadoEm ? ` · atualizado em ${dataCurta(perfil.atualizadoEm)}` : ""}
          </p>
        </>
      ) : (
        <p className="text-sm text-texto-secundario">
          Assim que a Lia terminar de ler suas peças, o que ela aprendeu aparece aqui.
        </p>
      )}
    </Card>
  );
}
