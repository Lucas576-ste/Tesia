import { SeloUrgencia } from "@/components/selo-urgencia";
import type { ProcessoAcompanhado } from "@/lib/clientes";

export function SeloProximoPrazo({
  urgencia,
}: {
  urgencia: NonNullable<ProcessoAcompanhado["urgenciaProximo"]>;
}) {
  return (
    <SeloUrgencia
      prazo={{
        id: "",
        partes: "",
        cnj: "",
        peca: "",
        area: "",
        status: "nao_iniciado",
        ...urgencia,
      }}
    />
  );
}
