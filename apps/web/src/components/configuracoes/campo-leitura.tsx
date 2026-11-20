import type { ReactNode } from "react";

export function CampoLeitura({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-3">
      <dt className="text-sm text-texto-secundario">{rotulo}</dt>
      <dd className="min-w-0 text-sm font-medium break-words">{children}</dd>
    </div>
  );
}

export function Chips({ itens, vazio }: { itens: string[]; vazio: string }) {
  if (itens.length === 0) return <span className="font-normal text-texto-secundario">{vazio}</span>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {itens.map((item) => (
        <li key={item} className="rounded-full bg-primaria-fundo px-2.5 py-0.5 text-xs font-medium">
          {item}
        </li>
      ))}
    </ul>
  );
}
