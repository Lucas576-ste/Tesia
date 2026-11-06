import type { Metadata } from "next";
import { advogadoExemplo, prazosExemplo } from "@/components/layout/dados-exemplo";
import { PainelPrazos } from "@/components/painel/painel-prazos";
import { buscarAnalise } from "@/lib/analises-exemplo";
import { filtroPrazosSchema } from "@/lib/filtros-prazos";
import { listarProcessos } from "@/lib/processos-exemplo";

export const metadata: Metadata = { title: "Painel de prazos · Tesia" };

type PainelPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const idsComAnalise = prazosExemplo.map(({ id }) => id).filter((id) => buscarAnalise(id));

const processos = listarProcessos().map(({ id, partes, cnj, area }) => ({
  id,
  partes,
  cnj,
  area,
}));

function urlSemNovo(parametros: Record<string, string | string[] | undefined>) {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(parametros)) {
    if (chave !== "novo" && typeof valor === "string") busca.set(chave, valor);
  }
  const texto = busca.toString();
  return texto ? `/app?${texto}` : "/app";
}

export default async function PainelPage({ searchParams }: PainelPageProps) {
  const parametros = await searchParams;
  const vazio = parametros.exemplo === "vazio";

  return (
    <PainelPrazos
      key={vazio ? "vazio" : "exemplo"}
      nome={advogadoExemplo.nome.split(" ")[0] ?? ""}
      prazosIniciais={vazio ? [] : prazosExemplo}
      filtro={filtroPrazosSchema.parse(parametros)}
      idsComAnalise={idsComAnalise}
      processos={processos}
      novoPrazo={parametros.novo === "prazo"}
      urlSemNovo={urlSemNovo(parametros)}
    />
  );
}
