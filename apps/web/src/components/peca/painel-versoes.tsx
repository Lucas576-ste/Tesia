import { History } from "lucide-react";
import { Button } from "@/components/ui/button";

export type VersaoPeca = {
  numero: number;
  rotulo: string;
};

type PainelVersoesProps = {
  versoes: VersaoPeca[];
  desativado: boolean;
  aoSalvar: () => void;
  aoRestaurar: (numero: number) => void;
};

export function PainelVersoes({ versoes, desativado, aoSalvar, aoRestaurar }: PainelVersoesProps) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
      <h2 className="text-lg font-semibold">Histórico de versões</h2>
      <ul className="flex flex-col gap-1 text-sm">
        {versoes.map(({ numero, rotulo }) => (
          <li key={numero} className="flex flex-wrap items-center gap-2">
            <History aria-hidden className="size-4 shrink-0 text-texto-secundario" />
            <span className="min-w-0 flex-1 basis-32">{rotulo}</span>
            <Button
              variant="ghost"
              size="sm"
              disabled={desativado}
              aria-label={`Restaurar versão ${numero}`}
              onClick={() => aoRestaurar(numero)}
            >
              Restaurar
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="outline" disabled={desativado} onClick={aoSalvar}>
        Salvar versão
      </Button>
    </section>
  );
}
