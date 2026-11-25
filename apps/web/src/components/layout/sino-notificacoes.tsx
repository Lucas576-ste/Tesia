"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { marcarNotificacoesLidas } from "@/app/app/notificacoes-acoes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Notificacao } from "@/lib/notificacoes";
import { cn } from "@/lib/utils";

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function SinoNotificacoes({ notificacoes }: { notificacoes: Notificacao[] }) {
  const router = useRouter();
  const [lidasAgora, setLidasAgora] = useState<string[]>([]);
  const naoLidas = notificacoes.filter(({ id, lida }) => !lida && !lidasAgora.includes(id));

  function aoAbrir(aberto: boolean) {
    if (aberto || naoLidas.length === 0) return;
    const ids = naoLidas.map(({ id }) => id);
    setLidasAgora((atuais) => [...atuais, ...ids]);
    void marcarNotificacoesLidas(ids).then(() => router.refresh());
  }

  return (
    <DropdownMenu onOpenChange={aoAbrir}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            naoLidas.length ? `Notificações, ${naoLidas.length} não lidas` : "Notificações"
          }
        >
          <Bell aria-hidden />
          {naoLidas.length > 0 && (
            <span
              aria-hidden
              className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
            >
              {naoLidas.length > 9 ? "9+" : naoLidas.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        <p className="px-2 py-1.5 text-sm font-semibold">Notificações</p>
        <DropdownMenuSeparator />
        {notificacoes.length === 0 ? (
          <p className="px-2 py-3 text-sm text-texto-secundario">Nada por aqui ainda.</p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {notificacoes.map(({ id, titulo, texto, href, lida, criadaEm }) => {
              const conteudo = (
                <>
                  <span className="flex items-center justify-between gap-2 text-sm font-medium">
                    {titulo}
                    <span className="text-xs font-normal text-texto-secundario">
                      {formatoData.format(new Date(criadaEm))}
                    </span>
                  </span>
                  {texto && <span className="block text-xs text-texto-secundario">{texto}</span>}
                </>
              );
              const classe = cn(
                "block rounded-sm px-2 py-2 hover:bg-muted",
                !lida && !lidasAgora.includes(id) && "bg-primaria-fundo",
              );
              return (
                <li key={id}>
                  {href ? (
                    <Link href={href} className={classe}>
                      {conteudo}
                    </Link>
                  ) : (
                    <div className={classe}>{conteudo}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
