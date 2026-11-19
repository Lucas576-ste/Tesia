import type { Metadata } from "next";
import { PainelPrazos } from "@/components/painel/painel-prazos";
import { urlSemNovo } from "@/lib/url-painel";
import { filtroPrazosSchema } from "@/lib/filtros-prazos";
import { resumoIntimacoes } from "@/lib/intimacoes";
import { listarPrazosConfirmados, listarProcessosResumo } from "@/lib/painel";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Prazos · Tesia" };

type PainelPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PrazosPage({ searchParams }: PainelPageProps) {
  const parametros = await searchParams;
  const [usuario, prazos, processos, intimacoes] = await Promise.all([
    exigirUsuario(),
    listarPrazosConfirmados(),
    listarProcessosResumo(),
    resumoIntimacoes(),
  ]);

  return (
    <PainelPrazos
      key={prazos.map((prazo) => `${prazo.prazoId}:${prazo.status}:${prazo.prazoInterno}`).join()}
      nome={usuario.nome.split(" ")[0] ?? ""}
      prazosIniciais={prazos}
      filtro={filtroPrazosSchema.parse(parametros)}
      idsComAnalise={prazos.filter((prazo) => prazo.id !== prazo.prazoId).map(({ id }) => id)}
      processos={processos}
      novoPrazo={parametros.novo === "prazo"}
      urlSemNovo={urlSemNovo(parametros, "/app/prazos")}
      modo="prazos"
      intimacoes={intimacoes}
    />
  );
}
