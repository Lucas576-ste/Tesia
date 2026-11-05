import type { Metadata } from "next";
import Link from "next/link";
import { EstadoVazio } from "@/components/estado-vazio";
import { TelaProcesso } from "@/components/processo/tela-processo";
import { Button } from "@/components/ui/button";
import { buscarProcesso } from "@/lib/processos-exemplo";

export const metadata: Metadata = { title: "Detalhe do processo · Tesia" };

type ProcessoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProcessoPage({ params }: ProcessoPageProps) {
  const { id } = await params;
  const processo = buscarProcesso(id);
  if (processo) return <TelaProcesso key={processo.id} processo={processo} />;

  return (
    <EstadoVazio
      titulo="Processo não encontrado"
      descricao="Este processo não faz parte da demonstração."
      acao={
        <Button asChild variant="outline">
          <Link href="/app/processos">Ver os processos</Link>
        </Button>
      }
    />
  );
}
