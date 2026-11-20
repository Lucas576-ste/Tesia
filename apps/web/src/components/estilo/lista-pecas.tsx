import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { tipoSugerido, type PecaEstilo } from "@/lib/estilo";
import { ItemPeca } from "./item-peca";

type ListaPecasProps = {
  pecas: PecaEstilo[];
  aoRemover: (id: string) => void;
};

export function ListaPecas({ pecas, aoRemover }: ListaPecasProps) {
  const sugestao = tipoSugerido(
    pecas.filter(({ status }) => status === "lido").map(({ tipo }) => tipo),
  );
  return (
    <section aria-label="Suas peças" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-titulo">Suas peças</h2>
      <Card className="gap-0 py-0">
        <ul aria-live="polite">
          {pecas.map((peca) => (
            <ItemPeca key={peca.id} peca={peca} aoRemover={() => aoRemover(peca.id)} />
          ))}
        </ul>
      </Card>
      {sugestao && (
        <p className="flex items-start gap-2 rounded-xl border border-borda bg-primaria-fundo p-3 text-sm">
          <Lightbulb aria-hidden className="mt-0.5 size-4 shrink-0 text-primaria" />
          Você ainda não enviou {sugestao}. Enviar uma ajuda a Lia nesse tipo de peça.
        </p>
      )}
    </section>
  );
}
