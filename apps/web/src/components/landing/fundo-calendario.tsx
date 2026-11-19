"use client";

import { useEffect, useRef } from "react";

const COLUNAS = 7;
const LINHAS = 5;
const PASSO_MS = 260;
const PAUSA_PASSOS = 8;

function diasUteis() {
  const dias: number[] = [];
  for (let i = 3; i < COLUNAS * LINHAS && dias.length < 15; i++) {
    const coluna = i % COLUNAS;
    if (coluna !== 0 && coluna !== 6) dias.push(i);
  }
  return dias;
}

export function FundoCalendario() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const tela = canvas;
    const contexto = ctx;
    const contagem = diasUteis();
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let passo = reduzir ? contagem.length : 0;
    let visivel = true;
    let ultimo = 0;
    let quadro = 0;

    function desenhar() {
      const { width, height } = tela.getBoundingClientRect();
      const escala = window.devicePixelRatio || 1;
      if (tela.width !== Math.round(width * escala)) {
        tela.width = Math.round(width * escala);
        tela.height = Math.round(height * escala);
      }
      contexto.setTransform(escala, 0, 0, escala, 0, 0);
      contexto.clearRect(0, 0, width, height);
      const lado = Math.max(56, Math.min(width / 9, 120));
      const larguraGrade = lado * COLUNAS;
      const x0 = width - larguraGrade - lado * 0.4;
      const y0 = (height - lado * LINHAS) / 2;
      const ativos = Math.min(passo, contagem.length);
      contexto.font = `500 ${Math.round(lado * 0.18)}px ui-sans-serif, system-ui`;
      for (let i = 0; i < COLUNAS * LINHAS; i++) {
        const x = x0 + (i % COLUNAS) * lado;
        const y = y0 + Math.floor(i / COLUNAS) * lado;
        const ordem = contagem.indexOf(i);
        const contado = ordem >= 0 && ordem < ativos;
        const vencimento = ordem === contagem.length - 1 && ativos === contagem.length;
        contexto.strokeStyle = "rgba(120, 120, 140, 0.16)";
        contexto.lineWidth = 1;
        contexto.strokeRect(x + 4, y + 4, lado - 8, lado - 8);
        if (contado) {
          contexto.fillStyle = vencimento ? "rgba(227, 179, 65, 0.55)" : "rgba(227, 179, 65, 0.16)";
          contexto.fillRect(x + 4, y + 4, lado - 8, lado - 8);
        }
        contexto.fillStyle = contado ? "rgba(150, 110, 20, 0.7)" : "rgba(120, 120, 140, 0.3)";
        contexto.fillText(String(i + 1), x + 10, y + 10 + lado * 0.18);
      }
    }

    function animar(tempo: number) {
      quadro = requestAnimationFrame(animar);
      if (!visivel || tempo - ultimo < PASSO_MS) return;
      ultimo = tempo;
      passo = passo >= contagem.length + PAUSA_PASSOS ? 0 : passo + 1;
      desenhar();
    }

    desenhar();
    const observador = new IntersectionObserver(([entrada]) => {
      visivel = entrada?.isIntersecting ?? true;
    });
    observador.observe(tela);
    const redimensionar = () => desenhar();
    window.addEventListener("resize", redimensionar);
    if (!reduzir) quadro = requestAnimationFrame(animar);

    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
      window.removeEventListener("resize", redimensionar);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full opacity-40 [mask-image:linear-gradient(to_left,black_40%,transparent)]"
    />
  );
}
