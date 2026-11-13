"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AvatarLia } from "@/components/lia/avatar-lia";
import type { EstadoPerfil, PerfilPronto } from "@/lib/perfil-estilo";

const INTERVALO_MS = 4000;

function ListaFrases({ perfil }: { perfil: PerfilPronto }) {
  return (
    <>
      <ul className="flex flex-col gap-2 text-sm">
        {perfil.frases.map((frase) => (
          <li key={frase} className="flex gap-2">
            <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-primaria" />
            {frase}
          </li>
        ))}
      </ul>
      <p className="text-xs text-texto-secundario">
        Baseado em {perfil.pecas} {perfil.pecas === 1 ? "peça" : "peças"} suas.
      </p>
    </>
  );
}

function Detalhes({ perfil }: { perfil: PerfilPronto }) {
  const detalhes = perfil.detalhes;
  if (!detalhes) return null;
  return (
    <details className="rounded-md border p-3 text-sm">
      <summary className="cursor-pointer font-medium">Ver detalhes do seu estilo</summary>
      <dl className="mt-2 flex flex-col gap-2 text-texto-secundario">
        {detalhes.estrutura_por_tipo.map(({ tipo, secoes }) => (
          <div key={tipo}>
            <dt className="font-medium text-texto">{tipo}</dt>
            <dd>{secoes.join(" → ")}</dd>
          </div>
        ))}
        <div>
          <dt className="font-medium text-texto">Tom</dt>
          <dd>{detalhes.tom}</dd>
        </div>
        <div>
          <dt className="font-medium text-texto">Como cita a lei</dt>
          <dd>{detalhes.citacao_lei}</dd>
        </div>
        {detalhes.referencias_frequentes.length > 0 && (
          <div>
            <dt className="font-medium text-texto">Citações frequentes</dt>
            <dd>{detalhes.referencias_frequentes.join("; ")}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium text-texto">Abertura e fechamento</dt>
          <dd>
            {detalhes.abertura} · {detalhes.fechamento}
          </dd>
        </div>
      </dl>
    </details>
  );
}

export function PainelAprendizado({
  perfil,
  comDetalhes = false,
}: {
  perfil: EstadoPerfil;
  comDetalhes?: boolean;
}) {
  const router = useRouter();
  const atualizando = perfil.estado === "atualizando";

  useEffect(() => {
    if (!atualizando) return;
    const intervalo = setInterval(() => router.refresh(), INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [atualizando, router]);

  const pronto =
    perfil.estado === "pronto" ? perfil : perfil.estado === "atualizando" ? perfil.anterior : null;

  return (
    <section
      aria-label="O que aprendi sobre você"
      className="flex flex-col gap-3 rounded-xl border-l-4 border-destaque bg-card p-4 shadow-xs"
    >
      <div className="flex flex-wrap items-center gap-2">
        <AvatarLia />
        <h2 className="font-serif text-lg font-semibold">O que aprendi sobre você</h2>
      </div>
      {atualizando && (
        <p role="status" className="flex items-center gap-2 text-sm text-texto-secundario">
          <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin" />
          Lendo seu jeito de escrever...
        </p>
      )}
      {pronto && <ListaFrases perfil={pronto} />}
      {pronto && comDetalhes && <Detalhes perfil={pronto} />}
      {!pronto && !atualizando && (
        <p className="text-sm text-texto-secundario">
          Envie suas peças e eu conto aqui o que aprendi sobre o seu jeito de escrever.
        </p>
      )}
    </section>
  );
}
