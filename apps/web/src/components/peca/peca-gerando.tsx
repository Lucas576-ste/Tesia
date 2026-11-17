"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BalaoLia } from "@/components/lia/balao-lia";

const INTERVALO_MS = 3000;

export function PecaGerando({ titulo }: { titulo: string }) {
  const router = useRouter();

  useEffect(() => {
    const intervalo = setInterval(() => router.refresh(), INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [router]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-10 text-center">
      <LoaderCircle aria-hidden className="size-10 animate-spin text-primaria" />
      <h1 role="status" className="text-xl font-semibold">
        Escrevendo seu rascunho
      </h1>
      <p className="text-sm text-texto-secundario">{titulo}</p>
      <BalaoLia className="text-sm">
        Estou buscando nas suas peças os trechos mais parecidos com este caso e escrevendo do seu
        jeito. Leva cerca de um minuto, e a página atualiza sozinha.
      </BalaoLia>
    </div>
  );
}
