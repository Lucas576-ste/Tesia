import type { Metadata } from "next";
import Link from "next/link";
import { SimboloTesia } from "@/components/layout/simbolo-tesia";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Página não encontrada · Tesia" };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <SimboloTesia />
      <div>
        <h1 className="text-xl font-semibold">Página não encontrada</h1>
        <p className="text-sm text-texto-secundario">
          Este endereço não existe ou foi digitado errado.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </main>
  );
}
