import { Inbox } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { estadoBanner, LINK_BUSCA_OAB, type EstadoBanner } from "@/lib/busca-oab";
import type { BannerSincronizacao } from "@/lib/intimacoes-lista-servidor";

type Chamada = { titulo: string; texto: string; acao: string; href: string };

const CHAMADAS: Partial<Record<EstadoBanner, Chamada>> = {
  convite: {
    titulo: "Receba suas intimações sem enviar PDF",
    texto: "Autorize a busca nos diários e as publicações da sua OAB chegam prontas para tratar.",
    acao: "Ativar em Configurações",
    href: LINK_BUSCA_OAB,
  },
  completarOab: {
    titulo: "Receba suas intimações sem enviar PDF",
    texto:
      "Complete o número da OAB e a UF para autorizar a busca das suas publicações nos diários.",
    acao: "Ativar em Configurações",
    href: LINK_BUSCA_OAB,
  },
  semPlano: {
    titulo: "A busca automática de intimações é do plano Pro",
    texto: "No Pro, as publicações da sua OAB nos diários chegam prontas para tratar.",
    acao: "Ver plano Pro",
    href: "/app/plano",
  },
};

export function ChamadaBuscaOab({ banner }: { banner: BannerSincronizacao | null }) {
  const estado = banner ? estadoBanner(banner) : null;
  const chamada = estado ? CHAMADAS[estado] : undefined;
  if (!chamada) return null;

  return (
    <Card className="flex-row flex-wrap items-center justify-between gap-3 border-primaria p-4">
      <div className="flex max-w-2xl items-start gap-3">
        <Inbox aria-hidden className="mt-0.5 size-5 shrink-0" />
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-titulo">{chamada.titulo}</h2>
          <p className="text-sm text-texto-secundario max-sm:hidden">{chamada.texto}</p>
        </div>
      </div>
      <Button asChild>
        <Link href={chamada.href}>{chamada.acao}</Link>
      </Button>
    </Card>
  );
}
