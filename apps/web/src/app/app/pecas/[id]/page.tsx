import type { Metadata } from "next";
import Link from "next/link";
import { EstadoVazio } from "@/components/estado-vazio";
import { TelaEditor } from "@/components/peca/tela-editor";
import { Button } from "@/components/ui/button";
import { buscarAnalise } from "@/lib/analises-exemplo";
import { buscarPeca } from "@/lib/pecas-exemplo";

export const metadata: Metadata = { title: "Editor da peça · Tesia" };

type PecaPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PecaPage({ params }: PecaPageProps) {
  const { id } = await params;
  const peca = buscarPeca(id);
  if (peca) return <TelaEditor key={peca.id} peca={peca} temAnalise={Boolean(buscarAnalise(id))} />;

  return (
    <EstadoVazio
      titulo="Esta peça não faz parte da demonstração"
      descricao="Por enquanto, há exemplos completos de duas peças."
      acao={
        <Button asChild variant="outline">
          <Link href="/app/pecas/1">Ver um exemplo</Link>
        </Button>
      }
    />
  );
}
