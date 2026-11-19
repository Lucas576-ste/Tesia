import type { Metadata } from "next";
import Link from "next/link";
import { TelaCliente } from "@/components/clientes/tela-cliente";
import { EstadoVazio } from "@/components/estado-vazio";
import { Button } from "@/components/ui/button";
import { buscarCliente, listarClientesSimples } from "@/lib/clientes";

export const metadata: Metadata = { title: "Cliente · Tesia" };

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [cliente, todos] = await Promise.all([buscarCliente(id), listarClientesSimples()]);
  if (!cliente) {
    return (
      <EstadoVazio
        titulo="Cliente não encontrado"
        descricao="Ele pode ter sido juntado com outro cadastro."
        acao={
          <Button asChild variant="outline">
            <Link href="/app/clientes">Ver os clientes</Link>
          </Button>
        }
      />
    );
  }
  return (
    <TelaCliente
      key={cliente.id}
      cliente={cliente}
      outros={todos.filter((outro) => outro.id !== cliente.id)}
    />
  );
}
