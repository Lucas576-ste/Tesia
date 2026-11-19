import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CTA_TESTE } from "./cta";

const garantias = [
  "Tudo liberado por 11 dias",
  "Sem cartão de crédito",
  "Sem taxa de ativação",
  "Cancele quando quiser",
];

export function FaixaTeste() {
  return (
    <section aria-labelledby="titulo-teste" className="bg-(image:--dourado) text-menu">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div className="flex flex-col gap-3">
          <h2 id="titulo-teste" className="text-4xl font-extrabold md:text-5xl">
            Comece grátis hoje.
          </h2>
          <p className="max-w-xl text-xl font-medium">
            Use a Tesia por 11 dias com tudo liberado: intimações, prazos, peças com IA e clientes.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-lg font-semibold">
            {garantias.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check aria-hidden className="size-5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Button
          asChild
          size="lg"
          className="h-14 shrink-0 bg-menu px-8 text-lg text-white bg-none hover:bg-menu/90"
        >
          <a href={CTA_TESTE.href}>{CTA_TESTE.texto}</a>
        </Button>
      </div>
    </section>
  );
}
