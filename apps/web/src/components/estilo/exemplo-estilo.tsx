"use client";

import { RefreshCw } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { consultarExemplo, pedirExemplo } from "@/app/app/estilo/acoes";
import type { EstadoExemplo } from "@/lib/estilo-servidor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const INTERVALO_MS = 2000;

function escapar(texto: string) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Destacado({ texto, expressoes }: { texto: string; expressoes: string[] }) {
  const validas = expressoes.map((expressao) => expressao.trim()).filter(Boolean);
  if (validas.length === 0) return <>{texto}</>;
  const partes = texto.split(new RegExp(`(${validas.map(escapar).join("|")})`, "gi"));
  return (
    <>
      {partes.map((parte, indice) => (
        <Fragment key={indice}>
          {validas.some((expressao) => expressao.toLowerCase() === parte.toLowerCase()) ? (
            <mark className="rounded-sm bg-destaque/25 px-0.5 text-inherit">{parte}</mark>
          ) : (
            parte
          )}
        </Fragment>
      ))}
    </>
  );
}

type ExemploEstiloProps = { inicial: EstadoExemplo; perfilGeradoEm: string | null };

export function ExemploEstilo({ inicial, perfilGeradoEm }: ExemploEstiloProps) {
  const [estado, setEstado] = useState(inicial);
  const [erroPedido, setErroPedido] = useState<string | null>(null);

  const desatualizado = Boolean(
    perfilGeradoEm && estado.geradoEm && estado.geradoEm < perfilGeradoEm,
  );
  const precisaPedir = !estado.gerando && (!estado.texto || desatualizado) && !estado.erro;

  async function pedir() {
    setErroPedido(null);
    setEstado((atual) => ({ ...atual, gerando: true, erro: false }));
    const resultado = await pedirExemplo();
    if ("erro" in resultado) {
      setErroPedido(resultado.erro);
      setEstado((atual) => ({ ...atual, gerando: false }));
    }
  }

  useEffect(() => {
    if (!precisaPedir) return;
    let atual = true;
    pedirExemplo().then((resultado) => {
      if (!atual) return;
      if ("erro" in resultado) setErroPedido(resultado.erro);
      else setEstado((anterior) => ({ ...anterior, gerando: true }));
    });
    return () => {
      atual = false;
    };
  }, [precisaPedir]);

  useEffect(() => {
    if (!estado.gerando) return;
    const intervalo = setInterval(async () => setEstado(await consultarExemplo()), INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [estado.gerando]);

  const gerando = estado.gerando;

  return (
    <Card id="exemplo-estilo" className="scroll-mt-20 gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-titulo">Veja no seu estilo</h2>
        <Button variant="outline" size="sm" disabled={gerando} onClick={() => void pedir()}>
          <RefreshCw aria-hidden className={gerando ? "animate-spin" : undefined} />
          Gerar outro exemplo
        </Button>
      </div>
      {gerando && !estado.texto ? (
        <div role="status" className="flex flex-col gap-2">
          <p className="text-sm text-texto-secundario">Escrevendo um exemplo no seu estilo…</p>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : estado.texto ? (
        <blockquote className="border-l-2 border-destaque pl-4 font-documento text-[0.95rem] leading-relaxed">
          <Destacado texto={estado.texto} expressoes={estado.expressoes} />
        </blockquote>
      ) : (
        <p className="text-sm text-texto-secundario">
          {erroPedido ?? "Não consegui gerar o exemplo agora. Tente de novo."}
        </p>
      )}
      <p className="text-xs text-texto-secundario">
        Parágrafo de exemplo com fatos inventados, escrito com o estilo que a Lia aprendeu.
      </p>
    </Card>
  );
}
