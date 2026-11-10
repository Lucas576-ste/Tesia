import { AlertCircle, CheckCircle2, FileText, LoaderCircle } from "lucide-react";
import { ROTULOS_STATUS, type StatusIntimacao } from "@/lib/envio-intimacao";
import { cn } from "@/lib/utils";

export type Envio = {
  chave: string;
  nome: string;
  status: StatusIntimacao | "enviando";
  intimacaoId?: string;
  erro?: string;
};

function IconeStatus({ status }: { status: Envio["status"] }) {
  if (status === "erro") return <AlertCircle aria-hidden className="size-4 shrink-0 text-erro" />;
  if (status === "analisada")
    return <CheckCircle2 aria-hidden className="size-4 shrink-0 text-sucesso" />;
  return <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin text-primaria" />;
}

export function ListaEnvios({ envios }: { envios: Envio[] }) {
  return (
    <ul role="status" aria-live="polite" className="flex flex-col gap-2">
      {envios.map(({ chave, nome, status, erro }) => (
        <li key={chave} className="flex items-center gap-2 rounded-md border bg-card p-3 text-sm">
          <FileText aria-hidden className="size-4 shrink-0 text-texto-secundario" />
          <span className="min-w-0 flex-1 break-all">{nome}</span>
          <span
            className={cn(
              "flex shrink-0 items-center gap-1.5 text-xs font-medium",
              status === "erro" ? "text-erro" : "text-texto-secundario",
            )}
          >
            <IconeStatus status={status} />
            {erro ?? ROTULOS_STATUS[status]}
          </span>
        </li>
      ))}
    </ul>
  );
}
