"use client";

import type { BlocoTimbrado, InspecaoModelo } from "@tesia/documentos";
import { PECA_EXEMPLO, textoDoNo } from "@tesia/shared";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PX_POR_MM = 3.7795;
const DISTANCIA_BORDA_MM = 12.5;

type BlocoImagem = Extract<BlocoTimbrado, { tipo: "imagem" }>;

function ehImagemDePagina(bloco: BlocoTimbrado): bloco is BlocoImagem {
  return bloco.tipo === "imagem" && bloco.posicao !== null && !!bloco.larguraMm && !!bloco.alturaMm;
}

function ImagemDePagina({
  bloco,
  pagina,
}: {
  bloco: BlocoImagem;
  pagina: InspecaoModelo["pagina"];
}) {
  const { posicao, larguraMm = 0, alturaMm = 0 } = bloco;
  if (!posicao || !larguraMm || !alturaMm) return null;
  const baseX = posicao.origemH === "pagina" ? 0 : pagina.esquerdaMm;
  const larguraBase =
    posicao.origemH === "pagina"
      ? pagina.larguraMm
      : pagina.larguraMm - pagina.esquerdaMm - pagina.direitaMm;
  const deslocamentoX =
    posicao.alinhamentoH === "center"
      ? (larguraBase - larguraMm) / 2
      : posicao.alinhamentoH === "right"
        ? larguraBase - larguraMm
        : posicao.xMm;
  const baseY =
    posicao.origemV === "pagina"
      ? 0
      : posicao.origemV === "margem"
        ? pagina.topoMm
        : DISTANCIA_BORDA_MM;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={bloco.dataUri}
      alt=""
      className="absolute max-w-none"
      style={{
        left: `${(baseX + deslocamentoX) * PX_POR_MM}px`,
        top: `${(baseY + posicao.yMm) * PX_POR_MM}px`,
        width: `${larguraMm * PX_POR_MM}px`,
        height: `${alturaMm * PX_POR_MM}px`,
        zIndex: posicao.atrasDoTexto ? 0 : 3,
      }}
    />
  );
}

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
        color: bloco.cor ?? undefined,
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
  const imagensDePagina = [...previa.cabecalho, ...previa.rodape].filter(ehImagemDePagina);
  const emLinha = (blocos: BlocoTimbrado[]) => blocos.filter((bloco) => !ehImagemDePagina(bloco));
  return (
    <div
      className="tema-claro relative overflow-hidden bg-white text-black"
      style={{
        width: mm(pagina.larguraMm),
        height: mm(pagina.alturaMm),
        fontFamily: `"${fonte.nome}", "Times New Roman", Times, serif`,
      }}
    >
      {imagensDePagina.map((bloco, indice) => (
        <ImagemDePagina key={indice} bloco={bloco} pagina={pagina} />
      ))}
      <div
        className="absolute flex flex-col gap-1"
        style={{
          zIndex: 1,
          top: mm(DISTANCIA_BORDA_MM),
          left: mm(pagina.esquerdaMm),
          right: mm(pagina.direitaMm),
        }}
      >
        {emLinha(previa.cabecalho).map((bloco, indice) => (
          <Bloco key={indice} bloco={bloco} />
        ))}
      </div>
      <div
        className="absolute"
        style={{
          zIndex: 2,
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
          zIndex: 1,
          bottom: mm(DISTANCIA_BORDA_MM),
          left: mm(pagina.esquerdaMm),
          right: mm(pagina.direitaMm),
          fontSize: `${Math.min(fonte.tamanhoPt, 10) * 1.333}px`,
        }}
      >
        {emLinha(previa.rodape).map((bloco, indice) => (
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
