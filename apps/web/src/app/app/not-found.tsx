import Link from "next/link";
import { EstadoVazio } from "@/components/estado-vazio";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <EstadoVazio
      titulo="Página não encontrada"
      descricao="Este endereço não existe ou foi digitado errado."
      acao={
        <Button asChild variant="outline">
          <Link href="/app">Voltar ao painel</Link>
        </Button>
      }
    />
  );
}
