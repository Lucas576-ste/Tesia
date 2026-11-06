import { cookies } from "next/headers";
import {
  COOKIE_PLANO_DEMO,
  COOKIE_USO_DEMO,
  montarEstadoPlano,
  mostrarSeletorPlano,
} from "@/lib/planos-exemplo";

export async function lerPlanoDemo() {
  if (!mostrarSeletorPlano) return montarEstadoPlano();
  const armazenados = await cookies();
  return montarEstadoPlano(
    armazenados.get(COOKIE_PLANO_DEMO)?.value,
    armazenados.get(COOKIE_USO_DEMO)?.value,
  );
}
