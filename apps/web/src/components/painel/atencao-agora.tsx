import { AlertTriangle, CalendarClock, CircleCheck, FilePen, Inbox } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { nomeCurto } from "@/lib/nome-curto";
import { destinoPrazo, type LinhaPrazo } from "@/lib/prazo";
import { nivelDoPrazo, ordenarPorUrgencia, textoDoPrazo } from "@/lib/urgencia";
import { cn } from "@/lib/utils";

type Item = {
  chave: string;
  titulo: string;
  detalhe: string;
  acao: string;
  href: string;
  tom: "erro" | "atencao" | "neutro";
  icone: typeof AlertTriangle;
};

function acaoDoPrazo(prazo: LinhaPrazo) {
  if (prazo.pecaId && prazo.status !== "nao_iniciado")
    return { acao: "Abrir rascunho", href: `/app/pecas/${prazo.pecaId}` };
  const destino = destinoPrazo(prazo);
  if (destino) return { acao: "Abrir análise", href: destino };
  return { acao: "Ver prazo", href: "/app/prazos" };
}

function itemDoPrazo(prazo: LinhaPrazo): Item {
  const nivel = nivelDoPrazo(prazo);
  const rascunho = prazo.status === "rascunho_pronto" && (nivel === "mais3" || nivel === "ate3");
  return {
    chave: prazo.prazoId ?? prazo.id,
    titulo: `${prazo.peca} · ${nomeCurto(prazo.partes)}`,
    detalhe: rascunho
      ? `Rascunho pronto para revisar · ${textoDoPrazo(prazo).toLowerCase()} (${prazo.vencimento})`
      : `${textoDoPrazo(prazo)} · prazo fatal ${prazo.vencimento}`,
    tom: nivel === "vencido" || nivel === "hoje" ? "erro" : rascunho ? "neutro" : "atencao",
    icone: nivel === "vencido" ? AlertTriangle : rascunho ? FilePen : CalendarClock,
    ...acaoDoPrazo(prazo),
  };
}

export function montarAtencao(prazos: LinhaPrazo[], intimacoesNovas: number): Item[] {
  const ordenados = ordenarPorUrgencia(prazos.filter(({ status }) => status !== "protocolado"));
  const graves = ordenados.filter((prazo) => ["vencido", "hoje"].includes(nivelDoPrazo(prazo)));
  const proximos = ordenados.filter((prazo) => nivelDoPrazo(prazo) === "ate3");
  const rascunhos = ordenados.filter(
    (prazo) => prazo.status === "rascunho_pronto" && nivelDoPrazo(prazo) === "mais3",
  );
  const intimacoes: Item[] = intimacoesNovas
    ? [
        {
          chave: "intimacoes",
          titulo:
            intimacoesNovas === 1
              ? "1 intimação nova aguardando você"
              : `${intimacoesNovas} intimações novas aguardando você`,
          detalhe: "Confira a análise e confirme o prazo para ele entrar no painel.",
          acao: "Conferir intimações",
          href: "/app/intimacoes?filtro=aguardando",
          tom: "atencao",
          icone: Inbox,
        },
      ]
    : [];
  return [
    ...graves.map(itemDoPrazo),
    ...intimacoes,
    ...proximos.map(itemDoPrazo),
    ...rascunhos.map(itemDoPrazo),
  ].slice(0, 3);
}

const TONS = {
  erro: "bg-erro-fundo text-erro",
  atencao: "bg-atencao-fundo text-atencao",
  neutro: "bg-primaria-fundo text-primaria",
};

export function AtencaoAgora({ itens }: { itens: Item[] }) {
  return (
    <section
      aria-labelledby="titulo-atencao"
      className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs"
    >
      <h2 id="titulo-atencao" className="text-lg font-semibold">
        Atenção agora
      </h2>
      {itens.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-sucesso">
          <CircleCheck aria-hidden className="size-4" />
          Tudo em dia ✓ Nenhum prazo vencido, vencendo ou intimação esperando você.
        </p>
      ) : (
        <ul className="flex flex-col divide-y">
          {itens.map(({ chave, titulo, detalhe, acao, href, tom, icone: Icone }) => (
            <li
              key={chave}
              className="flex flex-wrap items-center gap-3 py-2.5 first:pt-1 last:pb-0"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  TONS[tom],
                )}
              >
                <Icone aria-hidden className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 basis-56 flex-col">
                <span className="truncate font-medium" title={titulo}>
                  {titulo}
                </span>
                <span
                  className={cn("text-xs", tom === "erro" ? "text-erro" : "text-texto-secundario")}
                >
                  {detalhe}
                </span>
              </span>
              <Button asChild size="sm" variant={tom === "erro" ? "default" : "outline"}>
                <Link href={href}>{acao}</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
