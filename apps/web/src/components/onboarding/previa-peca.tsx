import { Badge } from "@/components/ui/badge";

export function PreviaPeca({ timbrado }: { timbrado: boolean }) {
  return (
    <section aria-label="Pré-visualização da peça" className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium">Como a peça vai sair</h2>
        <Badge variant="secondary">Exemplo</Badge>
      </div>
      <div
        aria-hidden
        className="tema-claro flex flex-col gap-3 rounded-md border bg-card p-5 text-xs shadow-xs"
      >
        {timbrado ? (
          <p className="rounded-sm bg-primaria-fundo py-3 text-center font-medium text-primaria">
            Seu papel timbrado aqui
          </p>
        ) : (
          <p className="border-b pb-2 text-center font-medium">Seu nome · OAB/UF 00.000</p>
        )}
        <p className="text-center font-serif text-sm font-semibold">CONTESTAÇÃO</p>
        <p>
          Maria Souza, já qualificada nos autos, vem apresentar contestação à ação movida por Banco
          X.
        </p>
        <p>O autor não juntou o contrato que fundamenta a cobrança.</p>
        <p className="text-right text-texto-secundario">Brasília, 25 de novembro de 2026.</p>
      </div>
      <p className="text-xs text-texto-secundario">
        Prévia ilustrativa: ela ainda não usa o seu arquivo.
      </p>
    </section>
  );
}
