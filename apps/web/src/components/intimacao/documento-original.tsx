import type { Analise } from "@/lib/analise";
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
      </div>
      <div className="tema-claro flex flex-col gap-3 rounded-md border bg-card p-5 text-sm shadow-xs">
        {analise.documento.length === 0 && (
          <p className="text-texto-secundario">O texto do documento não está disponível.</p>
        )}
        {analise.documento.map(({ id, texto }) => (
          <p
            key={id}
            id={`trecho-${id}`}
            className={cn(
              "scroll-mt-20 rounded-sm px-1 whitespace-pre-line transition-colors",
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
