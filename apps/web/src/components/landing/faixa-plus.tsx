import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function FaixaPlus() {
  return (
    <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className="font-serif text-lg font-semibold">Plus</span>
        <Badge variant="secondary">Em breve</Badge>
      </div>
      <p className="min-w-0 flex-1 text-sm text-texto-secundario">
        Complemento de qualquer plano: 20 posts por mês para o Instagram, calendário de conteúdo e
        textos dentro das regras de publicidade da OAB.
      </p>
      <span className="shrink-0 font-serif text-lg font-semibold tabular-nums">+ R$ 49/mês</span>
    </Card>
  );
}
