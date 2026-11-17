import { CircleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EstadoVazio } from "@/components/estado-vazio";
import { PecaGerando } from "@/components/peca/peca-gerando";
import { TelaEditor } from "@/components/peca/tela-editor";
import { VisualizacaoPeca } from "@/components/peca/visualizacao-peca";
import { Button } from "@/components/ui/button";
import { buscarAnalise } from "@/lib/analises-exemplo";
import { buscarPecaGerada } from "@/lib/peca";
import { buscarPeca } from "@/lib/pecas-exemplo";

export const metadata: Metadata = { title: "Peça · Tesia" };

type PecaPageProps = {
  params: Promise<{ id: string }>;
};

function ErroGeracao({ intimacaoId }: { intimacaoId: string | null }) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-xl bg-erro-fundo p-6 text-center"
    >
      <CircleAlert aria-hidden className="size-8 text-erro" />
      <h1 className="text-xl font-semibold">Não consegui escrever este rascunho</h1>
      <p className="text-sm">Esta tentativa não conta no seu limite de peças. Tente de novo.</p>
      {intimacaoId && (
        <Button asChild>
          <Link href={`/app/intimacoes/${intimacaoId}`}>Voltar e gerar de novo</Link>
        </Button>
      )}
    </div>
  );
}

export default async function PecaPage({ params }: PecaPageProps) {
  const { id } = await params;
  const gerada = await buscarPecaGerada(id);
  if (gerada?.status === "gerando") return <PecaGerando titulo={gerada.titulo} />;
  if (gerada?.status === "erro") return <ErroGeracao intimacaoId={gerada.intimacaoId} />;
  if (gerada) return <VisualizacaoPeca peca={gerada} />;

  const exemplo = buscarPeca(id);
  if (exemplo)
    return <TelaEditor key={exemplo.id} peca={exemplo} temAnalise={Boolean(buscarAnalise(id))} />;

  return (
    <EstadoVazio
      titulo="Peça não encontrada"
      descricao="Ela pode ter sido excluída ou pertencer a outro escritório."
      acao={
        <Button asChild variant="outline">
          <Link href="/app/intimacoes">Ver intimações</Link>
        </Button>
      }
    />
  );
}
