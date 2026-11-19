"use client";

import { MotionConfig, motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

export function ProvedorMovimento({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Revelar({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

const lista: Variants = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  oculto: { opacity: 0, y: 24 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function RevelarLista({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.ul
      className={className}
      variants={lista}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.ul>
  );
}

export function RevelarItem({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.li className={className} variants={item}>
      {children}
    </motion.li>
  );
}
