import { Skeleton } from "@/components/ui/skeleton";

export function EstadoCarregando({ linhas = 3 }: { linhas?: number }) {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-2">
      <span className="sr-only">Carregando</span>
      {Array.from({ length: linhas }, (_, indice) => (
        <Skeleton key={indice} className="h-8 w-full" />
      ))}
    </div>
  );
}
