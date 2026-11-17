import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VersaoSalva } from "@/lib/peca";

type PainelVersoesProps = {
  versoes: VersaoSalva[];
  desativado: boolean;
  salvando: boolean;
  podeSalvar: boolean;
  aoSalvar: () => void;
  aoRestaurar: (numero: number) => void;
};

function rotulo({ numero, origem, data, pedido }: VersaoSalva) {
  if (origem === "ia" && pedido)
    return `Versão ${numero}, ajustada pela Lia: "${pedido}" · ${data}`;
  return `Versão ${numero}, ${origem === "ia" ? "escrita pela Lia" : "salva por você"} · ${data}`;
}

export function PainelVersoes({
  versoes,
  desativado,
  salvando,
  podeSalvar,
  aoSalvar,
  aoRestaurar,
}: PainelVersoesProps) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
      <h2 className="text-lg font-semibold">Histórico de versões</h2>
      <ul className="flex flex-col gap-1 text-sm">
        {versoes.map((versao) => (
          <li key={versao.numero} className="flex flex-wrap items-center gap-2">
            <History aria-hidden className="size-4 shrink-0 text-texto-secundario" />
            <span className="min-w-0 flex-1 basis-32">{rotulo(versao)}</span>
            <Button
              variant="ghost"
              size="sm"
              disabled={desativado || salvando}
              aria-label={`Restaurar versão ${versao.numero}`}
              onClick={() => aoRestaurar(versao.numero)}
            >
              Restaurar
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="outline" disabled={desativado || salvando || !podeSalvar} onClick={aoSalvar}>
        {salvando ? "Salvando..." : "Salvar versão"}
      </Button>
    </section>
  );
}
