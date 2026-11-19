import { CalendarClock, Hourglass } from "lucide-react";
import Link from "next/link";
import type { ProcessoAcompanhado } from "@/lib/clientes";
import { BarraFases } from "./barra-fases";

export function CardProcesso({
  processo,
  mostrarCliente = false,
}: {
  processo: ProcessoAcompanhado;
  mostrarCliente?: boolean;
}) {
  return (
    <Link
      href={`/app/processos/${processo.id}`}
      className="flex flex-col gap-2 rounded-xl border bg-card p-3 text-sm shadow-xs transition hover:border-primary hover:shadow-md focus-visible:border-primary focus-visible:outline-none"
    >
      {mostrarCliente && (
        <span className="font-semibold text-titulo">
          {processo.clienteNome ?? "Sem cliente definido"}
        </span>
      )}
      <span className={mostrarCliente ? "text-xs text-texto-secundario" : "font-medium"}>
        {processo.partes}
      </span>
      <span className="text-xs text-texto-secundario tabular-nums">{processo.cnj}</span>
      <BarraFases
        rito={processo.rito}
        fase={processo.fase}
        encerrado={processo.etapa === "encerrado"}
        compacta
      />
      <span className="flex flex-col">
        <span className="font-medium text-primaria">{processo.nomeFase}</span>
        <span className="text-xs text-texto-secundario">{processo.origemFase}</span>
      </span>
      {processo.proximoPrazo && (
        <span className="flex items-center gap-1.5 text-xs">
          <CalendarClock aria-hidden className="size-3.5 text-primaria" />
          Próximo prazo: <strong className="tabular-nums">{processo.proximoPrazo}</strong>
        </span>
      )}
      {processo.diasParado && (
        <span className="flex items-center gap-1.5 text-xs text-atencao">
          <Hourglass aria-hidden className="size-3.5" />
          Parado há {processo.diasParado} dias
        </span>
      )}
    </Link>
  );
}
