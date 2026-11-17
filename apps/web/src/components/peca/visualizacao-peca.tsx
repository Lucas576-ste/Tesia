import { ArrowLeft, CircleAlert, FileText } from "lucide-react";
import Link from "next/link";
import { BalaoLia } from "@/components/lia/balao-lia";
import { Button } from "@/components/ui/button";
import type { PecaGerada } from "@/lib/peca";

function TextoComPendencias({ texto }: { texto: string }) {
  const partes = texto.split(/(\[CONFIRMAR:[^\]]+\])/g);
  return (
    <>
      {partes.map((parte, indice) =>
        parte.startsWith("[CONFIRMAR:") ? (
          <mark key={indice} className="rounded-sm bg-atencao-fundo px-0.5 text-atencao">
            {parte}
          </mark>
        ) : (
          <span key={indice}>{parte}</span>
        ),
      )}
    </>
  );
}

export function VisualizacaoPeca({ peca }: { peca: PecaGerada }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      {peca.intimacaoId && (
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={`/app/intimacoes/${peca.intimacaoId}`}>
            <ArrowLeft aria-hidden />
            Voltar à análise
          </Link>
        </Button>
      )}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-titulo md:text-3xl">{peca.titulo}</h1>
        <p className="text-sm text-texto-secundario">
          Rascunho para sua revisão. O editor completo, com versões e download, chega em seguida.
        </p>
      </header>
      {peca.aviso && (
        <p role="note" className="rounded-md bg-atencao-fundo p-3 text-sm text-atencao">
          {peca.aviso}
        </p>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
        <article className="tema-claro flex flex-col gap-5 rounded-md border bg-card p-6 font-serif text-[15px] leading-relaxed shadow-xs">
          {peca.secoes.map((secao, indice) => (
            <section
              key={`${secao.titulo}-${indice}`}
              id={`secao-${indice}`}
              className="scroll-mt-20"
            >
              {secao.titulo && <h2 className="mb-2 font-semibold">{secao.titulo}</h2>}
              {secao.texto.split(/\n{2,}/).map((paragrafo, i) => (
                <p key={i} className="mb-3 whitespace-pre-line">
                  <TextoComPendencias texto={paragrafo} />
                </p>
              ))}
            </section>
          ))}
        </article>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-16">
          <section className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
            <h2 className="flex items-center gap-2 font-semibold">
              <CircleAlert aria-hidden className="size-4 text-atencao" />
              Para conferir ({peca.pendencias.length})
            </h2>
            {peca.pendencias.length === 0 ? (
              <p className="text-sm text-texto-secundario">Nenhum ponto marcado para conferir.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {peca.pendencias.map((pendencia, indice) => (
                  <li key={indice}>
                    <a href={`#secao-${pendencia.secao}`} className="hover:underline">
                      <span className="block text-xs text-texto-secundario">
                        {pendencia.titulo || "Início da peça"}
                      </span>
                      {pendencia.texto}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
            <h2 className="font-semibold">Baseado nas suas peças</h2>
            {peca.fontes.length === 0 ? (
              <p className="text-sm text-texto-secundario">
                Nenhuma peça sua foi usada. Envie peças em Meu estilo.
              </p>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {peca.fontes.map((fonte, indice) => (
                  <li key={indice} className="flex items-center gap-2">
                    <FileText aria-hidden className="size-4 shrink-0 text-texto-secundario" />
                    {fonte.documento} · {fonte.secao}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <BalaoLia className="text-sm">
            Revise os pontos destacados antes de usar. A responsabilidade pelo texto final é sua.
          </BalaoLia>
        </aside>
      </div>
    </div>
  );
}
