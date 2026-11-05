import Link from "next/link";
import type { ReactNode } from "react";
import { SimboloTesia } from "@/components/layout/simbolo-tesia";
import { SeletorTema } from "@/components/tema/seletor-tema";
import { Card } from "@/components/ui/card";

export default function AutenticacaoLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-4 px-4 py-14">
      <div className="absolute top-3 right-3">
        <SeletorTema />
      </div>
      <Link href="/" className="flex min-h-9 items-center gap-2 font-serif text-xl font-semibold">
        <SimboloTesia />
        Tesia
      </Link>
      <Card className="w-full max-w-sm gap-4 px-5">{children}</Card>
    </main>
  );
}
