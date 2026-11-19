import { Quote } from "lucide-react";
import { depoimentos, visiveis } from "@/content/proof";
import { SecaoLanding } from "./secao-landing";
import { SeloExemplo } from "./selo-exemplo";
import { RevelarItem, RevelarLista } from "./revelar";

export function Depoimentos() {
  const itens = visiveis(depoimentos);
  if (itens.length === 0) return null;

  return (
    <SecaoLanding titulo="Quem usa, conta.">
      <RevelarLista className="grid gap-4 md:grid-cols-3">
        {itens.map(({ texto, nome, escritorio, isExample }) => (
          <RevelarItem
            key={nome}
            className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs"
          >
            <Quote aria-hidden className="size-6 text-primaria" />
            <blockquote className="flex-1 text-sm leading-relaxed">“{texto}”</blockquote>
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 font-semibold">
                {nome}
                <SeloExemplo ativo={isExample} />
              </span>
              <span className="text-xs text-texto-secundario">{escritorio}</span>
            </div>
          </RevelarItem>
        ))}
      </RevelarLista>
    </SecaoLanding>
  );
}
