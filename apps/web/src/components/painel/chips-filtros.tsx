"use client";

import { ChevronDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AREAS_ATUACAO } from "@/lib/onboarding";
import {
  FILTRO_PADRAO,
  filtroParaUrl,
  PERIODOS,
  temFiltro,
  type FiltroPrazos,
} from "@/lib/filtros-prazos";
import { cn } from "@/lib/utils";

const STATUS: { valor: FiltroPrazos["status"]; rotulo: string }[] = [
  { valor: "nao_iniciado", rotulo: "Não iniciado" },
  { valor: "rascunho_pronto", rotulo: "Rascunho pronto" },
  { valor: "protocolado", rotulo: "Protocolado" },
];

const URGENCIAS: { valor: FiltroPrazos["urgencia"]; rotulo: string }[] = [
  { valor: "vencido", rotulo: "Vencidos" },
  { valor: "3-dias", rotulo: "Até 3 dias" },
];

function Chip({
  ativo,
  aoClicar,
  children,
}: {
  ativo: boolean;
  aoClicar: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={aoClicar}
      className={cn(
        "h-7 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        ativo
          ? "border-primary bg-primaria-fundo text-primaria"
          : "bg-card text-texto-secundario hover:text-texto",
      )}
    >
      {children}
    </button>
  );
}

function Grupo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={rotulo} className="flex flex-wrap items-center gap-1.5">
      <span className="mr-0.5 text-xs font-semibold text-texto-secundario">{rotulo}</span>
      {children}
    </div>
  );
}

export function ChipsFiltros({ filtro, base }: { filtro: FiltroPrazos; base: string }) {
  const router = useRouter();

  function mudar(parcial: Partial<FiltroPrazos>) {
    router.replace(filtroParaUrl({ ...filtro, ...parcial }, base), { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Grupo rotulo="Prazo">
        {URGENCIAS.map(({ valor, rotulo }) => (
          <Chip
            key={valor}
            ativo={filtro.urgencia === valor}
            aoClicar={() => mudar({ urgencia: filtro.urgencia === valor ? "todas" : valor })}
          >
            {rotulo}
          </Chip>
        ))}
        {(Object.keys(PERIODOS) as (keyof typeof PERIODOS)[])
          .filter((chave) => chave !== "3-dias")
          .map((chave) => (
            <Chip
              key={chave}
              ativo={filtro.periodo === chave}
              aoClicar={() =>
                mudar({
                  periodo: filtro.periodo === chave ? "todos" : (chave as FiltroPrazos["periodo"]),
                })
              }
            >
              {PERIODOS[chave].rotulo.replace("Até ", "")}
            </Chip>
          ))}
      </Grupo>
      <Grupo rotulo="Status">
        {STATUS.map(({ valor, rotulo }) => (
          <Chip
            key={valor}
            ativo={filtro.status === valor}
            aoClicar={() => mudar({ status: filtro.status === valor ? "todos" : valor })}
          >
            {rotulo}
          </Chip>
        ))}
      </Grupo>
      <label
        className={cn(
          "relative flex h-7 items-center rounded-full border pr-7 pl-3 text-xs font-medium",
          filtro.area !== "todas"
            ? "border-primary bg-primaria-fundo text-primaria"
            : "bg-card text-texto-secundario",
        )}
      >
        <span className="sr-only">Área</span>
        <select
          value={filtro.area}
          onChange={(evento) => mudar({ area: evento.target.value as FiltroPrazos["area"] })}
          className="appearance-none bg-transparent outline-none"
        >
          <option value="todas">Todas as áreas</option>
          {AREAS_ATUACAO.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-2 size-3.5" />
      </label>
      {temFiltro(filtro) && (
        <button
          type="button"
          onClick={() => router.replace(filtroParaUrl(FILTRO_PADRAO, base), { scroll: false })}
          className="flex h-7 items-center gap-1 rounded-full px-2 text-xs font-medium text-primaria hover:underline"
        >
          <X aria-hidden className="size-3.5" />
          Limpar
        </button>
      )}
    </div>
  );
}
