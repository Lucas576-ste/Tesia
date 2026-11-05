import type { Metadata } from "next";
import { advogadoExemplo, prazosExemplo } from "@/components/layout/dados-exemplo";
import { PainelPrazos } from "@/components/painel/painel-prazos";
import { filtroPrazosSchema } from "@/lib/filtros-prazos";

export const metadata: Metadata = { title: "Painel de prazos · Tesia" };

type PainelPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PainelPage({ searchParams }: PainelPageProps) {
  const parametros = await searchParams;
  const vazio = parametros.exemplo === "vazio";

  return (
    <PainelPrazos
      key={vazio ? "vazio" : "exemplo"}
      nome={advogadoExemplo.nome.split(" ")[0] ?? ""}
      prazosIniciais={vazio ? [] : prazosExemplo}
      filtro={filtroPrazosSchema.parse(parametros)}
    />
  );
}
