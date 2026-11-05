import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const linhas = [
  { rotulo: "Publicação", valor: "03/11/2026" },
  { rotulo: "Início da contagem", valor: "04/11/2026" },
  { rotulo: "Prazo da contestação", valor: "15 dias úteis" },
  { rotulo: "Feriado no período", valor: "20/11/2026" },
];

export function ExemploPrazo() {
  return (
    <Card className="gap-3">
      <CardHeader>
        <CardDescription>Exemplo ilustrativo</CardDescription>
        <CardTitle className="text-lg">A conta do prazo, explicada</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-2 text-sm">
          {linhas.map(({ rotulo, valor }) => (
            <div key={rotulo} className="flex justify-between gap-4">
              <dt className="text-texto-secundario">{rotulo}</dt>
              <dd className="tabular-nums">{valor}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t pt-2 font-medium">
            <dt>Vencimento</dt>
            <dd className="tabular-nums">25/11/2026</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
