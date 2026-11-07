import { cn } from "@/lib/utils";

type UsoMesProps = {
  usadas: number;
  limite: number;
  className?: string;
};

function coresUso(percentual: number) {
  if (percentual >= 100) return { barra: "bg-erro", texto: "text-erro" };
  if (percentual >= 80) return { barra: "bg-atencao", texto: "text-atencao" };
  return { barra: "bg-primaria", texto: "text-texto-secundario" };
}

export function UsoMes({ usadas, limite, className }: UsoMesProps) {
  const percentual = limite > 0 ? Math.min(100, Math.round((usadas / limite) * 100)) : 0;
  const cores = coresUso(percentual);

  return (
    <div className={cn("flex w-fit flex-col gap-1", className)}>
      <span className={cn("text-xs whitespace-nowrap tabular-nums", cores.texto)}>
        {usadas} de {limite}
        <span className="max-[359px]:sr-only"> peças</span>
      </span>
      <div
        role="progressbar"
        aria-label="Uso do mês"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentual}
        className="h-1 w-full overflow-hidden rounded-full bg-borda"
      >
        <div
          className={cn("h-full rounded-full", cores.barra)}
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}
