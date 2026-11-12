"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BalaoLia } from "@/components/lia/balao-lia";

const INTERVALO_MS = 3000;

export function AnaliseEmAndamento({ lendo }: { lendo: boolean }) {
  const router = useRouter();

  useEffect(() => {
    const intervalo = setInterval(() => router.refresh(), INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [router]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-10 text-center">
      <LoaderCircle aria-hidden className="size-10 animate-spin text-primaria" />
      <h1 role="status" className="text-xl font-semibold">
        {lendo ? "Lendo o documento" : "Na fila para análise"}
      </h1>
      <BalaoLia className="text-sm">
        Estou lendo a intimação, calculando o prazo e separando os pontos importantes. Esta página
        atualiza sozinha quando eu terminar.
      </BalaoLia>
    </div>
  );
}
