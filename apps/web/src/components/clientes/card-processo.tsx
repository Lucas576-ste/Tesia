import { tituloNome } from "@tesia/shared";
import { CalendarClock, Hourglass } from "lucide-react";
import Link from "next/link";
import type { ProcessoAcompanhado } from "@/lib/clientes";
import { BarraFases } from "./barra-fases";
import { SeloFase } from "./selo-fase";

export function CardProcesso({
  processo,
  mostrarCliente = false,
}: {
  processo: ProcessoAcompanhado;
  mostrarCliente?: boolean;
}) {
  return (
    <div className="relative flex flex-col gap-2 rounded-xl border bg-card p-3 text-sm shadow-card transition hover:border-primary">
      {mostrarCliente && (
        <span className="font-semibold text-titulo">
          {processo.clienteNome ? tituloNome(processo.clienteNome) : "Sem cliente definido"}
        </span>
      )}
      <Link
        href={`/app/processos/${processo.id}`}
        className={`outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring ${
          mostrarCliente ? "text-xs text-texto-secundario" : "font-medium"
        }`}
      >
        {processo.partes
          .split(/\s+x\s+/i)
          .map(tituloNome)
          .join(" x ")}
      </Link>
      <span className="font-mono text-xs text-texto-secundario">{processo.cnj}</span>
      <BarraFases
        rito={processo.rito}
        fase={processo.fase}
        encerrado={processo.etapa === "encerrado"}
        compacta
      />
      <span className="flex flex-col items-start gap-1">
        <SeloFase processo={processo} />
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
    </div>
  );
}
