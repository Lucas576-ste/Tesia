import { z } from "zod";
import { AREAS_ATUACAO } from "@/lib/onboarding";
import type { LinhaPrazo } from "@/lib/prazo";
import { nivelDoPrazo } from "@/lib/urgencia";

export const PERIODOS = {
  "3-dias": { rotulo: "Até 3 dias úteis", dias: 3 },
  "7-dias": { rotulo: "Até 7 dias úteis", dias: 7 },
  "30-dias": { rotulo: "Até 30 dias úteis", dias: 30 },
} as const;

export const filtroPrazosSchema = z.object({
  status: z.enum(["todos", "nao_iniciado", "rascunho_pronto", "protocolado"]).catch("todos"),
  area: z.enum(["todas", ...AREAS_ATUACAO]).catch("todas"),
  periodo: z.enum(["todos", "7-dias", "30-dias"]).catch("todos"),
  urgencia: z.enum(["todas", "vencido", "3-dias"]).catch("todas"),
});

export type FiltroPrazos = z.infer<typeof filtroPrazosSchema>;

export const FILTRO_PADRAO: FiltroPrazos = {
  status: "todos",
  area: "todas",
  periodo: "todos",
  urgencia: "todas",
};

export function filtrarPrazos(
  prazos: LinhaPrazo[],
  { status, area, periodo, urgencia }: FiltroPrazos,
) {
  return prazos.filter((prazo) => {
    if (status !== "todos" && prazo.status !== status) return false;
    if (area !== "todas" && prazo.area !== area) return false;
    const nivel = nivelDoPrazo(prazo);
    if (urgencia === "vencido" && nivel !== "vencido") return false;
    if (urgencia === "3-dias" && nivel !== "hoje" && nivel !== "ate3") return false;
    if (
      periodo !== "todos" &&
      (nivel === "concluido" || nivel === "vencido" || prazo.diasUteis > PERIODOS[periodo].dias)
    )
      return false;
    return true;
  });
}

export function temFiltro(filtro: FiltroPrazos) {
  return (Object.keys(FILTRO_PADRAO) as (keyof FiltroPrazos)[]).some(
    (chave) => filtro[chave] !== FILTRO_PADRAO[chave],
  );
}

export function filtroParaUrl(filtro: FiltroPrazos, base = "/app") {
  const parametros = new URLSearchParams();
  if (filtro.status !== "todos") parametros.set("status", filtro.status);
  if (filtro.area !== "todas") parametros.set("area", filtro.area);
  if (filtro.periodo !== "todos") parametros.set("periodo", filtro.periodo);
  if (filtro.urgencia !== "todas") parametros.set("urgencia", filtro.urgencia);
  const texto = parametros.toString();
  return texto ? `${base}?${texto}` : base;
}
