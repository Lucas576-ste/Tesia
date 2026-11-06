import { Columns3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VisaoPainel } from "./usar-visao-painel";

const opcoes = [
  { valor: "lista", rotulo: "Lista", icone: List },
  { valor: "quadro", rotulo: "Quadro", icone: Columns3 },
] as const;

type AlternarVisaoProps = {
  visao: VisaoPainel;
  aoTrocar: (visao: VisaoPainel) => void;
};

export function AlternarVisao({ visao, aoTrocar }: AlternarVisaoProps) {
  return (
    <div role="group" aria-label="Forma de ver os prazos" className="flex w-fit gap-1">
      {opcoes.map(({ valor, rotulo, icone: Icone }) => (
        <Button
          key={valor}
          size="sm"
          variant={visao === valor ? "secondary" : "ghost"}
          aria-pressed={visao === valor}
          onClick={() => aoTrocar(valor)}
        >
          <Icone aria-hidden />
          {rotulo}
        </Button>
      ))}
    </div>
  );
}
