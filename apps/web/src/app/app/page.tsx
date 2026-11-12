import type { Metadata } from "next";
import { PainelPrazos } from "@/components/painel/painel-prazos";
import { filtroPrazosSchema } from "@/lib/filtros-prazos";
import { listarPrazosConfirmados, listarProcessosResumo } from "@/lib/painel";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Painel de prazos · Tesia" };

type PainelPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
  const [usuario, prazos, processos] = await Promise.all([
    exigirUsuario(),
    listarPrazosConfirmados(),
    listarProcessosResumo(),
  ]);

  return (
    <PainelPrazos
      nome={usuario.nome.split(" ")[0] ?? ""}
      prazosIniciais={prazos}
      filtro={filtroPrazosSchema.parse(parametros)}
      idsComAnalise={prazos.map(({ id }) => id)}
      processos={processos}
      novoPrazo={parametros.novo === "prazo"}
      urlSemNovo={urlSemNovo(parametros)}
    />
  );
}
