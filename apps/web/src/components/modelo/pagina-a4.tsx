"use client";

import type { BlocoTimbrado, InspecaoModelo } from "@tesia/documentos";
import { PECA_EXEMPLO, textoDoNo } from "@tesia/shared";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PX_POR_MM = 3.7795;
const DISTANCIA_BORDA_MM = 12.5;

function Bloco({ bloco }: { bloco: BlocoTimbrado }) {
  if (bloco.tipo === "imagem") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={bloco.dataUri}
        alt=""
        style={{
          width: bloco.larguraMm ? `${bloco.larguraMm * PX_POR_MM}px` : undefined,
          height: bloco.alturaMm ? `${bloco.alturaMm * PX_POR_MM}px` : undefined,
          maxWidth: "100%",
          margin: "0 auto",
          display: "block",
        }}
      />
    );
  }
  return (
    <p
      style={{
        textAlign: bloco.alinhamento,
        fontWeight: bloco.negrito ? 700 : 400,
        fontSize: bloco.tamanhoPt ? `${bloco.tamanhoPt * 1.333}px` : undefined,
      }}
    >
      {bloco.texto}
    </p>
  );
}

function CorpoExemplo({ fontePt }: { fontePt: number }) {
  const blocos = PECA_EXEMPLO.content ?? [];
  return (
    <div style={{ fontSize: `${fontePt * 1.333}px`, lineHeight: 1.5 }}>
      {blocos.map((no, indice) => {
        const texto = textoDoNo(no);
        const destaque = no.type === "heading" || indice === 0;
        const data = indice === blocos.length - 1;
        return (
          <p
            key={indice}
            style={{
              fontWeight: destaque ? 700 : 400,
              textAlign: data ? "right" : destaque ? "left" : "justify",
              textIndent: destaque || data ? 0 : "30mm",
              margin: "0 0 0.8em",
            }}
          >
            {texto}
          </p>
        );
      })}
    </div>
  );
}

function Folha({ previa }: { previa: InspecaoModelo }) {
  const { pagina, fonte } = previa;
  const mm = (valor: number) => `${valor * PX_POR_MM}px`;
  return (
    <div
      className="tema-claro relative overflow-hidden bg-white text-black"
      style={{
        width: mm(pagina.larguraMm),
        height: mm(pagina.alturaMm),
        fontFamily: `"${fonte.nome}", "Times New Roman", Times, serif`,
      }}
    >
      <div
        className="absolute flex flex-col gap-1"
        style={{
          top: mm(DISTANCIA_BORDA_MM),
          left: mm(pagina.esquerdaMm),
          right: mm(pagina.direitaMm),
        }}
      >
        {previa.cabecalho.map((bloco, indice) => (
          <Bloco key={indice} bloco={bloco} />
        ))}
      </div>
      <div
        className="absolute"
        style={{
          top: mm(pagina.topoMm + 20),
          left: mm(pagina.esquerdaMm),
          right: mm(pagina.direitaMm),
          bottom: mm(pagina.baixoMm),
        }}
      >
        <CorpoExemplo fontePt={fonte.tamanhoPt} />
      </div>
      <div
        className="absolute flex flex-col gap-1"
        style={{
          bottom: mm(DISTANCIA_BORDA_MM),
          left: mm(pagina.esquerdaMm),
          right: mm(pagina.direitaMm),
          fontSize: `${Math.min(fonte.tamanhoPt, 10) * 1.333}px`,
        }}
      >
        {previa.rodape.map((bloco, indice) => (
          <Bloco key={indice} bloco={bloco} />
        ))}
      </div>
    </div>
  );
}

type PaginaA4Props = {
  previa: InspecaoModelo;
  escala?: number;
  className?: string;
};

export function PaginaA4({ previa, escala, className }: PaginaA4Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const [larguraCaixa, setLarguraCaixa] = useState(0);
  const larguraFolha = previa.pagina.larguraMm * PX_POR_MM;
  const alturaFolha = previa.pagina.alturaMm * PX_POR_MM;

  useEffect(() => {
    if (escala || !caixa.current) return;
    const observador = new ResizeObserver(([entrada]) =>
      setLarguraCaixa(entrada?.contentRect.width ?? 0),
    );
    observador.observe(caixa.current);
    return () => observador.disconnect();
  }, [escala]);

  const fator = escala ?? (larguraCaixa ? larguraCaixa / larguraFolha : 0);

  return (
    <div
      ref={caixa}
      className={cn("overflow-hidden rounded-sm border bg-white shadow-sm", className)}
      style={{
        width: escala ? larguraFolha * escala : "100%",
        height: alturaFolha * fator || undefined,
        aspectRatio: fator ? undefined : `${larguraFolha} / ${alturaFolha}`,
      }}
    >
      {fator > 0 && (
        <div style={{ width: larguraFolha, transform: `scale(${fator})`, transformOrigin: "0 0" }}>
          <Folha previa={previa} />
        </div>
      )}
    </div>
  );
}
