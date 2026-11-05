import { FileText, Scale } from "lucide-react";
import Link from "next/link";
import type { PecaExemplo } from "@/lib/pecas-exemplo";

function ListaFontes({
  titulo,
  itens,
  icone: Icone,
}: {
  titulo: string;
  itens: string[];
  icone: typeof FileText;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{titulo}</h3>
      <ul className="mt-1 flex flex-col gap-1 text-sm text-texto-secundario">
        {itens.map((item) => (
          <li key={item} className="flex gap-2">
            <Icone aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0 break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PainelFontes({ peca, temAnalise }: { peca: PecaExemplo; temAnalise: boolean }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs">
      <h2 className="text-lg font-semibold">Como foi montado</h2>
      <ListaFontes titulo="Suas peças usadas como base" itens={peca.pecasBase} icone={FileText} />
      <ListaFontes titulo="Documentos de origem" itens={peca.documentos} icone={Scale} />
      {temAnalise && (
        <Link
          href={`/app/intimacoes/${peca.id}`}
          className="w-fit py-1 text-sm text-primaria underline"
        >
          Ver a análise da intimação
        </Link>
      )}
    </section>
  );
}
