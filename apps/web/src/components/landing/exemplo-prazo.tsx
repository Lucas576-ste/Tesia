"use client";

import { motion, type Variants } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const linhas = [
  { rotulo: "Contestação", valor: "CPC art. 335" },
  { rotulo: "Publicação", valor: "03/11/2026" },
  { rotulo: "Início da contagem", valor: "04/11/2026" },
  { rotulo: "Prazo da contestação", valor: "15 dias úteis" },
  { rotulo: "Feriado no período", valor: "20/11/2026" },
];

const lista: Variants = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.35, delayChildren: 0.4 } },
};

const linha: Variants = {
  oculto: { opacity: 0, x: -12 },
  visivel: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

const vencimento: Variants = {
  oculto: { opacity: 0, x: -12 },
  visivel: {
    opacity: 1,
    x: 0,
    backgroundColor: ["rgb(227 179 65 / 0)", "rgb(227 179 65 / 0.45)", "rgb(227 179 65 / 0.15)"],
    transition: { duration: 1.2 },
  },
};

export function ExemploPrazo({ compacto = false }: { compacto?: boolean }) {
  return (
    <Card
      className={
        compacto ? "gap-2 py-4 text-sm shadow-xl shadow-black/20" : "gap-3 shadow-lg shadow-black/5"
      }
    >
      <CardHeader>
        <CardDescription>Exemplo ilustrativo</CardDescription>
        <CardTitle className={compacto ? "text-base" : "text-lg"}>
          A conta do prazo, explicada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.dl
          className={compacto ? "flex flex-col gap-1.5 text-xs" : "flex flex-col gap-2 text-sm"}
          variants={lista}
          initial={compacto ? "visivel" : "oculto"}
          whileInView="visivel"
          viewport={{ once: true, amount: 0.6 }}
        >
          {linhas.map(({ rotulo, valor }) => (
            <motion.div key={rotulo} variants={linha} className="flex justify-between gap-4">
              <dt className="text-texto-secundario">{rotulo}</dt>
              <dd className="tabular-nums">{valor}</dd>
            </motion.div>
          ))}
          <motion.div
            variants={vencimento}
            className="-mx-2 flex justify-between gap-4 rounded-md border-t px-2 pt-2 pb-1 font-semibold"
          >
            <dt>Vencimento</dt>
            <dd className="tabular-nums text-primaria">25/11/2026</dd>
          </motion.div>
        </motion.dl>
      </CardContent>
    </Card>
  );
}
