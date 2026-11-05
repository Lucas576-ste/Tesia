import { Sparkles } from "lucide-react";
import { AvatarLia } from "@/components/lia/avatar-lia";
import { Badge } from "@/components/ui/badge";

const frases = [
  "Você abre com os fatos antes de entrar no direito.",
  "Prefere parágrafos curtos e tom direto.",
  "Separa as seções com títulos em caixa alta.",
  "Fecha os pedidos em lista numerada.",
];

export function PainelAprendizado() {
  return (
    <section
      aria-label="O que aprendi sobre você"
      className="flex flex-col gap-3 rounded-xl border-l-4 border-destaque bg-card p-4 shadow-xs"
    >
      <div className="flex flex-wrap items-center gap-2">
        <AvatarLia />
        <h2 className="font-serif text-lg font-semibold">O que aprendi sobre você</h2>
        <Badge variant="secondary">Exemplo</Badge>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {frases.map((frase) => (
          <li key={frase} className="flex gap-2">
            <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-primaria" />
            {frase}
          </li>
        ))}
      </ul>
      <p className="text-xs text-texto-secundario">
        Estas frases são um exemplo fixo. Na versão final, elas virão das suas peças.
      </p>
    </section>
  );
}
