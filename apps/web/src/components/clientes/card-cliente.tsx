import { CalendarClock, History, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import type { ClienteResumo } from "@/lib/clientes";
import { linkWhatsapp, resumoCliente, textoHaDias } from "@/lib/resumo-cliente";
import { AvatarCliente } from "./avatar-cliente";
import { SeloFase } from "./selo-fase";
import { SeloProximoPrazo } from "./selo-proximo-prazo";

export function CardCliente({ cliente }: { cliente: ClienteResumo }) {
  const resumo = resumoCliente(cliente);

  return (
    <li className="relative flex h-full flex-col gap-3 rounded-xl border bg-card p-4 shadow-card transition hover:border-primary">
      <div className="flex items-start gap-3">
        <AvatarCliente nome={resumo.nome} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Link
            href={`/app/clientes/${cliente.id}`}
            className="truncate text-base font-semibold text-titulo outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {resumo.nome}
          </Link>
          <span className="truncate text-xs text-texto-secundario">
            {[resumo.areas.join(", "), resumo.textoProcessos].filter(Boolean).join(" · ")}
          </span>
        </div>
      </div>
      {resumo.processoPrincipal && <SeloFase processo={resumo.processoPrincipal} />}
      <dl className="grid gap-1.5 text-sm">
        <div className="flex items-center gap-2">
          <dt className="flex items-center gap-1.5 text-texto-secundario">
            <CalendarClock aria-hidden className="size-3.5" />
            Próximo prazo
          </dt>
          <dd className="ml-auto">
            {resumo.proximo ? (
              <span className="flex items-center gap-2">
                <span className="tabular-nums">{resumo.proximo.vencimento}</span>
                <SeloProximoPrazo urgencia={resumo.proximo} />
              </span>
            ) : (
              <span className="text-texto-secundario">Nenhum</span>
            )}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="flex items-center gap-1.5 text-texto-secundario">
            <History aria-hidden className="size-3.5" />
            Última movimentação
          </dt>
          <dd className="ml-auto">{textoHaDias(resumo.diasMovimentacao)}</dd>
        </div>
      </dl>
      {resumo.telefone && (
        <div className="relative z-10 mt-auto flex flex-wrap gap-3 border-t pt-2 text-xs">
          <a
            href={`tel:${resumo.telefone.replace(/\D/g, "")}`}
            className="flex items-center gap-1 text-texto-secundario hover:text-texto"
          >
            <Phone aria-hidden className="size-3.5" />
            {resumo.telefone}
          </a>
          <a
            href={linkWhatsapp(resumo.telefone)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 font-medium text-primaria hover:underline"
          >
            <MessageCircle aria-hidden className="size-3.5" />
            WhatsApp
          </a>
        </div>
      )}
    </li>
  );
}
