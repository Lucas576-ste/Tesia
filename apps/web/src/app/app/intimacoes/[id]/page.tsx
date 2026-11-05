import { CircleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EstadoVazio } from "@/components/estado-vazio";
import { TelaAnalise } from "@/components/intimacao/tela-analise";
import { Button } from "@/components/ui/button";
import { buscarAnalise } from "@/lib/analises-exemplo";

export const metadata: Metadata = { title: "Análise da intimação · Tesia" };

function DocumentoIlegivel() {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-xl bg-erro-fundo p-6 text-center"
    >
      <CircleAlert aria-hidden className="size-8 text-erro" />
      <h1 className="text-xl font-semibold">Não consegui ler este documento</h1>
      <p className="text-sm">
        O arquivo pode estar ilegível ou mal digitalizado. Envie de novo, de preferência o PDF
        original do tribunal.
      </p>
      <Button asChild>
        <Link href="/app/intimacoes/nova">Enviar de novo</Link>
      </Button>
    </div>
  );
}

type AnalisePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnalisePage({ params }: AnalisePageProps) {
  const { id } = await params;
  if (id === "ilegivel") return <DocumentoIlegivel />;

  const analise = buscarAnalise(id);
  if (analise) return <TelaAnalise key={analise.id} analise={analise} />;

  return (
    <EstadoVazio
      titulo="Esta análise não faz parte da demonstração"
      descricao="Por enquanto, há exemplos completos de dois prazos."
      acao={
        <Button asChild variant="outline">
          <Link href="/app/intimacoes/1">Ver um exemplo</Link>
        </Button>
      }
    />
  );
}
