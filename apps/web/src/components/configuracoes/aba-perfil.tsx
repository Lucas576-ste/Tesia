"use client";

import { toast } from "sonner";
import { FormularioPerfil } from "@/components/onboarding/formulario-perfil";
import { usePlanoDemo } from "@/components/plano/provedor-plano-demo";
import { Card } from "@/components/ui/card";
import { perfilContaExemplo } from "@/lib/conta-exemplo";

export function AbaPerfil() {
  const { maxAreas } = usePlanoDemo().plano;
  const areas = perfilContaExemplo.areas.slice(0, maxAreas ?? undefined);

  return (
    <Card className="p-4">
      <FormularioPerfil
        comNome
        valoresIniciais={{ ...perfilContaExemplo, areas }}
        maxAreas={maxAreas}
        rotuloBotao="Salvar"
        aoSalvar={() => toast.success("Perfil salvo neste exemplo. Nada foi enviado.")}
      />
    </Card>
  );
}
