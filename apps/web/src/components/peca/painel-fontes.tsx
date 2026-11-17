import { FileText } from "lucide-react";
import Link from "next/link";

type PainelFontesProps = {
  fontes: { documento: string; secao: string }[];
  intimacaoId: string | null;
};

const ROTULOS_SECAO: Record<string, string> = {
  enderecamento: "endereçamento",
  qualificacao: "qualificação",
  fatos: "fatos",
  preliminares: "preliminares",
  fundamentos: "fundamentos",
  pedidos: "pedidos",
  fechamento: "fechamento",
  outra: "outro trecho",
};

export function PainelFontes({ fontes, intimacaoId }: PainelFontesProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs">
      <h2 className="text-lg font-semibold">Como foi montado</h2>
      <div>
        <h3 className="text-sm font-semibold">Suas peças usadas como base</h3>
        {fontes.length === 0 ? (
          <p className="mt-1 text-sm text-texto-secundario">
            Nenhuma peça sua foi usada. Envie peças em Meu estilo.
          </p>
        ) : (
          <ul className="mt-1 flex flex-col gap-1 text-sm text-texto-secundario">
            {fontes.map(({ documento, secao }, indice) => (
              <li key={indice} className="flex gap-2">
                <FileText aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0 break-words">
                  {documento} · {ROTULOS_SECAO[secao] ?? secao}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {intimacaoId && (
        <Link
          href={`/app/intimacoes/${intimacaoId}`}
          className="w-fit py-1 text-sm text-primaria underline"
        >
          Ver a análise da intimação
        </Link>
      )}
    </section>
  );
}
