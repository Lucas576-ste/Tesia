import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EstadoVazio } from "@/components/estado-vazio";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Tela em construção · Tesia" };

const telasPendentes = new Map([
  ["processos", "Processos"],
  ["pecas", "Peças"],
  ["estilo", "Meu estilo"],
  ["configuracoes", "Configurações"],
]);

type TelaPendentePageProps = {
  params: Promise<{ resto: string[] }>;
};

export default async function TelaPendentePage({ params }: TelaPendentePageProps) {
  const { resto } = await params;
  const tela = telasPendentes.get(resto[0] ?? "");
  if (!tela) notFound();

  return (
    <EstadoVazio
      titulo={tela}
      descricao="Esta tela ainda não está pronta."
      acao={
        <Button asChild variant="outline">
          <Link href="/app">Voltar ao painel</Link>
        </Button>
      }
    />
  );
}
