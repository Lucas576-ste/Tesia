import { CircleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EstadoVazio } from "@/components/estado-vazio";
import { AnaliseEmAndamento } from "@/components/intimacao/analise-em-andamento";
import { TelaAnalise } from "@/components/intimacao/tela-analise";
import { Button } from "@/components/ui/button";
import { buscarIntimacao } from "@/lib/analise";
import { listarProcessosResumo } from "@/lib/painel";
import { buscarUsoPecas } from "@/lib/uso-pecas";

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
  const intimacao = await buscarIntimacao(id);

  if (!intimacao) {
    return (
      <EstadoVazio
        titulo="Intimação não encontrada"
        descricao="Ela pode ter sido excluída ou pertencer a outro escritório."
        acao={
          <Button asChild variant="outline">
            <Link href="/app/intimacoes/nova">Enviar uma intimação</Link>
          </Button>
        }
      />
    );
  }
  if (intimacao.status === "erro") return <DocumentoIlegivel />;
  if (intimacao.status !== "analisada") {
    return <AnaliseEmAndamento lendo={intimacao.status === "processando"} />;
  }
  const [uso, processos] = await Promise.all([buscarUsoPecas(), listarProcessosResumo()]);
  return (
    <TelaAnalise
      key={intimacao.analise.id}
      analise={intimacao.analise}
      uso={uso}
      processos={processos}
    />
  );
}
