import { Badge } from "@/components/ui/badge";
import type { Analise } from "@/lib/analises-exemplo";
import { cn } from "@/lib/utils";

type DocumentoOriginalProps = {
  analise: Analise;
  destaque: string | null;
};

export function DocumentoOriginal({ analise, destaque }: DocumentoOriginalProps) {
  return (
    <section aria-label="Documento original" className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium">Documento original</h2>
        <Badge variant="secondary">Exemplo ilustrativo</Badge>
      </div>
      <div className="tema-claro flex flex-col gap-3 rounded-md border bg-card p-5 text-sm shadow-xs">
        <p className="text-center font-serif font-semibold">{analise.orgao}</p>
        <p className="text-center text-xs tabular-nums">Processo {analise.cnj}</p>
        {analise.documento.map(({ id, texto }) => (
          <p
            key={id}
            id={`trecho-${id}`}
            className={cn(
              "scroll-mt-20 rounded-sm px-1 transition-colors",
              destaque === id && "bg-destaque text-menu",
            )}
          >
            {texto}
          </p>
        ))}
      </div>
    </section>
  );
}
