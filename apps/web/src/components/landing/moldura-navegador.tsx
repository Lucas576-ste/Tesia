"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";

type MolduraNavegadorProps = {
  legenda: string;
  children: ReactNode;
};

export function MolduraNavegador({ legenda, children }: MolduraNavegadorProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const inclinacaoX = useMotionValue(0);
  const inclinacaoY = useMotionValue(0);
  const rotateX = useSpring(inclinacaoX, { stiffness: 150, damping: 18 });
  const rotateY = useSpring(inclinacaoY, { stiffness: 150, damping: 18 });

  function mover(evento: PointerEvent<HTMLElement>) {
    if (evento.pointerType !== "mouse") return;
    const caixa = evento.currentTarget.getBoundingClientRect();
    const px = (evento.clientX - caixa.left) / caixa.width - 0.5;
    const py = (evento.clientY - caixa.top) / caixa.height - 0.5;
    inclinacaoY.set(px * 8);
    inclinacaoX.set(py * -6);
  }

  function sair() {
    inclinacaoX.set(0);
    inclinacaoY.set(0);
  }

  return (
    <motion.figure
      ref={ref}
      onPointerMove={mover}
      onPointerLeave={sair}
      style={{ y, rotateX, rotateY, transformPerspective: 1100 }}
      className="overflow-hidden rounded-xl border bg-card shadow-lg shadow-black/5"
    >
      <div aria-hidden className="flex gap-1.5 border-b px-3 py-2">
        <span className="size-2.5 rounded-full bg-erro" />
        <span className="size-2.5 rounded-full bg-destaque" />
        <span className="size-2.5 rounded-full bg-sucesso" />
      </div>
      {children}
      <figcaption className="border-t bg-muted px-3 py-1.5 text-xs text-texto-secundario">
        {legenda}
      </figcaption>
    </motion.figure>
  );
}
