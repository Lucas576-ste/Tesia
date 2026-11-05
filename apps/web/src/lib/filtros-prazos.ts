import { z } from "zod";
import { AREAS_ATUACAO } from "@/lib/onboarding";
import type { LinhaPrazo } from "@/lib/prazo";

export const PERIODOS = {
  "3-dias": { rotulo: "Até 3 dias úteis", dias: 3 },
  "7-dias": { rotulo: "Até 7 dias úteis", dias: 7 },
  "30-dias": { rotulo: "Até 30 dias úteis", dias: 30 },
} as const;

export const filtroPrazosSchema = z.object({
  status: z.enum(["todos", "nao_iniciado", "rascunho_pronto", "protocolado"]).catch("todos"),
  area: z.enum(["todas", ...AREAS_ATUACAO]).catch("todas"),
  periodo: z.enum(["todos", "3-dias", "7-dias", "30-dias"]).catch("todos"),
});

export type FiltroPrazos = z.infer<typeof filtroPrazosSchema>;

export const FILTRO_PADRAO: FiltroPrazos = { status: "todos", area: "todas", periodo: "todos" };

export function filtrarPrazos(prazos: LinhaPrazo[], { status, area, periodo }: FiltroPrazos) {
  return prazos.filter((prazo) => {
    if (status !== "todos" && prazo.status !== status) return false;
    if (area !== "todas" && prazo.area !== area) return false;
    if (periodo === "todos") return true;
    return prazo.status !== "protocolado" && prazo.diasUteis <= PERIODOS[periodo].dias;
  });
}

export function filtroParaUrl(filtro: FiltroPrazos) {
  const parametros = new URLSearchParams();
  if (filtro.status !== "todos") parametros.set("status", filtro.status);
  if (filtro.area !== "todas") parametros.set("area", filtro.area);
  if (filtro.periodo !== "todos") parametros.set("periodo", filtro.periodo);
  const texto = parametros.toString();
  return texto ? `/app?${texto}` : "/app";
}
