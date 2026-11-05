"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import {
  FILTRO_PADRAO,
  PERIODOS,
  filtroParaUrl,
  filtroPrazosSchema,
  type FiltroPrazos,
} from "@/lib/filtros-prazos";
import { AREAS_ATUACAO } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

function CampoFiltro({
  id,
  rotulo,
  valor,
  aoMudar,
  children,
}: {
  id: keyof FiltroPrazos;
  rotulo: string;
  valor: string;
  aoMudar: (campo: keyof FiltroPrazos, valor: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={`filtro-${id}`}>{rotulo}</Label>
      <SelectNativo
        id={`filtro-${id}`}
        value={valor}
        onChange={(evento: ChangeEvent<HTMLSelectElement>) => aoMudar(id, evento.target.value)}
      >
        {children}
      </SelectNativo>
    </div>
  );
}

export function FiltrosPrazos({ filtro }: { filtro: FiltroPrazos }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const temFiltro = filtroParaUrl(filtro) !== "/app";
  const ativos = [
    filtro.status !== "todos",
    filtro.area !== "todas",
    filtro.periodo !== "todos",
  ].filter(Boolean).length;

  function aoMudar(campo: keyof FiltroPrazos, valor: string) {
    const novo = filtroPrazosSchema.parse({ ...filtro, [campo]: valor });
    router.replace(filtroParaUrl(novo), { scroll: false });
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="outline"
        aria-expanded={aberto}
        aria-controls="filtros-prazos"
        onClick={() => setAberto((atual) => !atual)}
        className="sm:hidden"
      >
        <SlidersHorizontal aria-hidden />
        {ativos > 0 ? `Filtros (${ativos})` : "Filtros"}
      </Button>
      <div
        id="filtros-prazos"
        className={cn(
          "items-end gap-3 sm:grid sm:grid-cols-[1fr_1fr_1fr_auto]",
          aberto ? "grid" : "hidden",
        )}
      >
        <CampoFiltro id="status" rotulo="Status" valor={filtro.status} aoMudar={aoMudar}>
          <option value="todos">Todos</option>
          <option value="nao_iniciado">Não iniciado</option>
          <option value="rascunho_pronto">Rascunho pronto</option>
          <option value="protocolado">Protocolado</option>
        </CampoFiltro>
        <CampoFiltro id="area" rotulo="Área" valor={filtro.area} aoMudar={aoMudar}>
          <option value="todas">Todas</option>
          {AREAS_ATUACAO.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </CampoFiltro>
        <CampoFiltro id="periodo" rotulo="Período" valor={filtro.periodo} aoMudar={aoMudar}>
          <option value="todos">Todos</option>
          {Object.entries(PERIODOS).map(([valor, { rotulo }]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </CampoFiltro>
        <Button
          variant="ghost"
          disabled={!temFiltro}
          onClick={() => router.replace(filtroParaUrl(FILTRO_PADRAO), { scroll: false })}
        >
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
