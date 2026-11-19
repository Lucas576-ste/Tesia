"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";

export function LinhaPassos({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const escala = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  return (
    <ol ref={ref} className="relative flex flex-col gap-10 pl-7 md:pl-0">
      <span
        aria-hidden
        className="absolute top-0 bottom-0 left-2 w-0.5 rounded-full bg-borda md:left-1/2 md:-translate-x-1/2"
      />
      <motion.span
        aria-hidden
        style={{ scaleY: escala }}
        className="absolute top-0 bottom-0 left-2 w-0.5 origin-top rounded-full bg-(image:--dourado) md:left-1/2 md:-translate-x-1/2"
      />
      {children}
    </ol>
  );
}
