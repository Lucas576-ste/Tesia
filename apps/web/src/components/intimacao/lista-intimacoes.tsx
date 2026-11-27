"use client";

import { AlertCircle, CheckCircle2, Clock, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EstadoVazio } from "@/components/estado-vazio";
import { Button } from "@/components/ui/button";
import {
  urlDasIntimacoes,
  type FiltrosIntimacoes,
  type PaginaIntimacoes,
} from "@/lib/intimacoes-lista";
import { ROTULOS_SITUACAO, type SituacaoIntimacao } from "@/lib/situacao-intimacao";
import type { Responsavel } from "@/lib/termos";
import { cn } from "@/lib/utils";
import { BarraLote } from "./barra-lote";

const INTERVALO_MS = 4000;

const ESTILO_SITUACAO: Record<SituacaoIntimacao, string> = {
  fila: "text-texto-secundario",
  lendo: "text-texto-secundario",
  aguardando: "text-atencao",
  confirmado: "text-sucesso",
  concluida: "text-texto-secundario",
  ignorada: "text-texto-secundario",
  erro: "text-erro",
};

function IconeSituacao({ situacao }: { situacao: SituacaoIntimacao }) {
  if (situacao === "confirmado" || situacao === "concluida")
    return <CheckCircle2 aria-hidden className="size-4 shrink-0" />;
  if (situacao === "ignorada") return <EyeOff aria-hidden className="size-4 shrink-0" />;
  if (situacao === "aguardando") return <Clock aria-hidden className="size-4 shrink-0" />;
  if (situacao === "erro") return <AlertCircle aria-hidden className="size-4 shrink-0" />;
  return <Clock aria-hidden className="size-4 shrink-0" />;
}

type ListaIntimacoesProps = {
  pagina: PaginaIntimacoes;
  filtros: FiltrosIntimacoes;
  responsaveis: Responsavel[];
  comFiltros: boolean;
};

export function ListaIntimacoes({
  pagina,
  filtros,
  responsaveis,
  comFiltros,
}: ListaIntimacoesProps) {
  const router = useRouter();
  const [marcadasBrutas, setMarcadas] = useState<string[]>([]);
  const marcadas = marcadasBrutas.filter((id) => pagina.linhas.some((linha) => linha.id === id));
  const emAndamento = pagina.linhas.some(
    ({ situacao }) => situacao === "fila" || situacao === "lendo",
  );

  useEffect(() => {
    if (!emAndamento) return;
    const intervalo = setInterval(() => router.refresh(), INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [emAndamento, router]);

  if (pagina.linhas.length === 0) {
    return comFiltros ? (
      <EstadoVazio
        titulo="Nenhuma intimação encontrada"
        descricao="Nenhuma intimação combina com a busca e os filtros escolhidos."
        acao={
          <Button asChild variant="outline">
            <Link href="/app/intimacoes">Ver todas</Link>
          </Button>
        }
      />
    ) : (
      <EstadoVazio
        titulo="Nenhuma intimação ainda"
        descricao="Envie o PDF da intimação ou ative em Configurações a busca da sua OAB nos diários."
        acao={
          <Button asChild>
            <Link href="/app/intimacoes/nova">Enviar intimação</Link>
          </Button>
        }
      />
    );
  }

  const todasMarcadas = marcadas.length === pagina.linhas.length;
  const alternar = (id: string) =>
    setMarcadas((atuais) =>
      atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id],
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 text-sm text-texto-secundario">
        <label className="flex items-center gap-2 max-md:min-h-9">
          <input
            type="checkbox"
            className="size-4 accent-primaria"
            checked={todasMarcadas}
            onChange={() => setMarcadas(todasMarcadas ? [] : pagina.linhas.map(({ id }) => id))}
          />
          Selecionar esta página
        </label>
        <span className="tabular-nums">
          {pagina.total === 1 ? "1 intimação" : `${pagina.total} intimações`}
        </span>
      </div>
      <ul className="flex flex-col divide-y rounded-xl border bg-card shadow-xs">
        {pagina.linhas.map((linha) => (
          <li key={linha.id} className="flex items-start gap-3 p-4 hover:bg-muted/50">
            <label className="-m-2.5 flex shrink-0 cursor-pointer self-start p-2.5 md:m-0 md:p-0">
              <input
                type="checkbox"
                aria-label={`Selecionar intimação de ${linha.partes}`}
                className="mt-1 size-4 accent-primaria"
                checked={marcadas.includes(linha.id)}
                onChange={() => alternar(linha.id)}
              />
            </label>
            <Link
              href={`/app/intimacoes/${linha.id}`}
              className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-sm focus-visible:outline-none"
            >
              <span className="flex min-w-0 flex-1 basis-64 flex-col">
                <span className="flex flex-wrap items-center gap-2 font-medium">
                  {linha.partes}
                  {linha.djen && (
                    <span className="rounded-sm bg-primaria-fundo px-1.5 py-0.5 text-[10px] font-semibold text-primaria">
                      DIÁRIO
                    </span>
                  )}
                  {linha.uf && (
                    <span className="text-xs font-normal text-texto-secundario">{linha.uf}</span>
                  )}
                </span>
                <span className="text-xs text-texto-secundario tabular-nums">
                  {[linha.cnj, linha.tipo ?? linha.peca].filter(Boolean).join(" · ") ||
                    "Processo ainda não identificado"}
                </span>
                <span className="text-xs text-texto-secundario">
                  {[linha.termo, linha.responsavelNome && `Responsável: ${linha.responsavelNome}`]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <span className="text-xs text-texto-secundario tabular-nums">{linha.data}</span>
              <span
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  ESTILO_SITUACAO[linha.situacao],
                )}
              >
                <IconeSituacao situacao={linha.situacao} />
                {ROTULOS_SITUACAO[linha.situacao]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {pagina.paginas > 1 && (
        <nav aria-label="Páginas" className="flex items-center justify-between text-sm">
          <Button asChild variant="outline" size="sm" disabled={pagina.pagina <= 1}>
            <Link
              aria-disabled={pagina.pagina <= 1}
              href={urlDasIntimacoes(filtros, { pagina: Math.max(1, pagina.pagina - 1) })}
            >
              Anterior
            </Link>
          </Button>
          <span className="tabular-nums">
            Página {pagina.pagina} de {pagina.paginas}
          </span>
          <Button asChild variant="outline" size="sm" disabled={pagina.pagina >= pagina.paginas}>
            <Link
              aria-disabled={pagina.pagina >= pagina.paginas}
              href={urlDasIntimacoes(filtros, {
                pagina: Math.min(pagina.paginas, pagina.pagina + 1),
              })}
            >
              Próxima
            </Link>
          </Button>
        </nav>
      )}
      {marcadas.length > 0 && (
        <BarraLote ids={marcadas} responsaveis={responsaveis} aoLimpar={() => setMarcadas([])} />
      )}
    </div>
  );
}
