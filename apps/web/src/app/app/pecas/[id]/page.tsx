import { CircleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EstadoVazio } from "@/components/estado-vazio";
import { PecaGerando } from "@/components/peca/peca-gerando";
import { TelaEditor } from "@/components/peca/tela-editor";
import { Button } from "@/components/ui/button";
import { buscarPeca } from "@/lib/peca";

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
  const estado = await buscarPeca(id);
  if (estado?.status === "gerando") return <PecaGerando titulo={estado.titulo} />;
  if (estado?.status === "erro") return <ErroGeracao intimacaoId={estado.intimacaoId} />;
  if (estado) return <TelaEditor key={estado.peca.id} peca={estado.peca} />;

  return (
    <EstadoVazio
      titulo="Peça não encontrada"
      descricao="Ela pode ter sido excluída ou pertencer a outro escritório."
      acao={
        <Button asChild variant="outline">
          <Link href="/app/pecas">Ver peças</Link>
        </Button>
      }
    />
  );
}
