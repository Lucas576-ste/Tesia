import type { Metadata } from "next";
import Link from "next/link";
import { EstadoVazio } from "@/components/estado-vazio";
import { TelaProcesso } from "@/components/processo/tela-processo";
import { Button } from "@/components/ui/button";
import { listarClientesSimples } from "@/lib/clientes";
import { buscarProcesso } from "@/lib/processos";

export const metadata: Metadata = { title: "Detalhe do processo · Tesia" };

type ProcessoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProcessoPage({ params }: ProcessoPageProps) {
  const { id } = await params;
  const [processo, clientes] = await Promise.all([buscarProcesso(id), listarClientesSimples()]);
  if (processo) return <TelaProcesso key={processo.id} processo={processo} clientes={clientes} />;

  return (
    <EstadoVazio
      titulo="Processo não encontrado"
      descricao="Ele pode ter sido excluído ou pertencer a outro escritório."
      acao={
        <Button asChild variant="outline">
          <Link href="/app/clientes?aba=processos">Ver os processos</Link>
        </Button>
      }
    />
  );
}
