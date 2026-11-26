import { CircleAlert, RefreshCw } from "lucide-react";
import Link from "next/link";
import { ChamadaBuscaOab } from "@/components/chamada-busca-oab";
import { estadoBanner, LINK_BUSCA_OAB, podeBuscarAgora } from "@/lib/busca-oab";
import type { BannerSincronizacao } from "@/lib/intimacoes-lista-servidor";
import { BotaoBuscarAgora } from "./botao-buscar-agora";

const formatoHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

function textoMonitorando(ultimaBusca: string | null) {
  return ultimaBusca
    ? `Monitorando sua OAB · última busca às ${formatoHora.format(new Date(ultimaBusca))}`
    : "Monitorando sua OAB · primeira busca em andamento";
}

export function BannerSincronizacaoIntimacoes({ banner }: { banner: BannerSincronizacao | null }) {
  if (!banner) return null;
  const estado = estadoBanner(banner);
  if (!estado) return null;
  if (estado !== "monitorando" && estado !== "falha") {
    return <ChamadaBuscaOab banner={banner} />;
  }
  const falha = estado === "falha";
  const classes = `flex flex-wrap items-center gap-2 rounded-md px-3 py-2 text-sm ${falha ? "bg-erro-fundo" : "bg-muted"}`;

  return (
    <p className={classes}>
      {falha ? (
        <CircleAlert aria-hidden className="size-4 text-erro" />
      ) : (
        <RefreshCw aria-hidden className="size-4" />
      )}
      {estado === "monitorando" && textoMonitorando(banner.ultimaBusca)}
      {falha && (
        <>
          Houve um problema na busca da sua OAB.
          <Link href={LINK_BUSCA_OAB} className="font-medium underline">
            Ver no Perfil
          </Link>
        </>
      )}
      {banner.aceitou && banner.podeGerenciar && podeBuscarAgora(process.env.NODE_ENV) && (
        <BotaoBuscarAgora />
      )}
    </p>
  );
}
