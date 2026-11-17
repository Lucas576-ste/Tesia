import type { Metadata } from "next";
import Link from "next/link";
import { EstadoVazio } from "@/components/estado-vazio";
import { ListaPecas } from "@/components/peca/lista-pecas";
import { Button } from "@/components/ui/button";
import { listarPecasEscritorio } from "@/lib/pecas";

export const metadata: Metadata = { title: "Peças · Tesia" };

export default async function PecasPage() {
  const pecas = await listarPecasEscritorio();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header>
        <h1 className="text-3xl font-semibold text-titulo">Peças</h1>
      </header>
      {pecas.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma peça ainda"
          descricao="Os rascunhos aparecem aqui depois que você confirma o prazo de uma intimação e pede o rascunho."
          acao={
            <Button asChild variant="outline">
              <Link href="/app/intimacoes">Ver intimações</Link>
            </Button>
          }
        />
      ) : (
        <ListaPecas pecas={pecas} />
      )}
    </div>
  );
}
