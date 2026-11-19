"use client";

import { useEffect, useRef } from "react";

export function HaloMouse() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const halo = ref.current;
    const secao = halo?.parentElement;
    if (!halo || !secao) return;
    function mover(evento: PointerEvent) {
      if (evento.pointerType !== "mouse" || !halo || !secao) return;
      const caixa = secao.getBoundingClientRect();
      halo.style.setProperty("--x", `${evento.clientX - caixa.left}px`);
      halo.style.setProperty("--y", `${evento.clientY - caixa.top}px`);
    }
    secao.addEventListener("pointermove", mover);
    return () => secao.removeEventListener("pointermove", mover);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 transition-[background] duration-300"
      style={{
        background:
          "radial-gradient(420px circle at var(--x, 50%) var(--y, 30%), rgb(227 179 65 / 0.16), transparent 65%)",
      }}
    />
  );
}
