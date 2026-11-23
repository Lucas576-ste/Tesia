import { FAIXAS_ETARIAS, ORIGENS, type OrigemCliente } from "@tesia/shared";
import Link from "next/link";
import type { ReactNode } from "react";
import { urlDaLista, type FiltrosLista } from "@/lib/clientes-lista";
import { faixasEmOrdem, textoVariacao, type MetricasClientes } from "@/lib/clientes-metricas";

type Barra = { rotulo: string; total: number };

function CartaoMetrica({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section
      aria-label={titulo}
      className="flex min-w-0 flex-col gap-1.5 rounded-xl border bg-card p-3.5 shadow-card"
    >
      <h3 className="text-xs font-medium text-texto-secundario">{titulo}</h3>
      {children}
    </section>
  );
}

function Numero({ href, valor, legenda }: { href: string; valor: number; legenda: string }) {
  return (
    <Link href={href} className="flex flex-col gap-0.5 rounded-md hover:underline">
      <span className="text-2xl font-semibold text-titulo tabular-nums">{valor}</span>
      <span className="text-xs text-texto-secundario">{legenda}</span>
    </Link>
  );
}

function Barras({ itens, vazio }: { itens: Barra[]; vazio: string }) {
  const maior = Math.max(1, ...itens.map(({ total }) => total));
  if (itens.every(({ total }) => total === 0)) {
    return <p className="text-xs text-texto-secundario">{vazio}</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {itens.map(({ rotulo, total }) => (
        <li key={rotulo} className="flex flex-col gap-0.5">
          <span className="flex items-baseline justify-between gap-2 text-xs">
            <span className="truncate">{rotulo}</span>
            <span className="text-texto-secundario tabular-nums">{total}</span>
          </span>
          <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primaria"
              style={{ width: `${(total / maior) * 100}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

function rotuloOrigem(chave: string) {
  return ORIGENS[chave as OrigemCliente] ?? chave;
}

export function MetricasDeClientes({
  metricas,
  filtros,
}: {
  metricas: MetricasClientes;
  filtros: FiltrosLista;
}) {
  if (metricas.total === 0) return null;
  const aberta = (processo?: "com" | "sem") =>
    urlDaLista(filtros, { papel: "cliente", processo, pagina: 1 });
  const porcentagem = (parte: number) => Math.round((parte / metricas.total) * 100);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <CartaoMetrica titulo="Clientes">
        <Numero
          href={aberta()}
          valor={metricas.total}
          legenda={textoVariacao(metricas.novos_mes_atual, metricas.novos_mes_anterior)}
        />
      </CartaoMetrica>
      <CartaoMetrica titulo="Com processo">
        <Numero
          href={aberta("com")}
          valor={metricas.com_processo}
          legenda={`${porcentagem(metricas.com_processo)}% da carteira`}
        />
      </CartaoMetrica>
      <CartaoMetrica titulo="Sem processo">
        <Numero
          href={aberta("sem")}
          valor={metricas.sem_processo}
          legenda={`${porcentagem(metricas.sem_processo)}% da carteira`}
        />
      </CartaoMetrica>
      <CartaoMetrica titulo="Origens">
        <Barras
          itens={metricas.top_origens.map(({ chave, total }) => ({
            rotulo: rotuloOrigem(chave),
            total,
          }))}
          vazio="Sem dados."
        />
      </CartaoMetrica>
      <CartaoMetrica titulo="Faixa etária">
        <Barras
          itens={faixasEmOrdem(metricas.faixas_etarias).map(({ faixa, total }) => ({
            rotulo: FAIXAS_ETARIAS[faixa],
            total,
          }))}
          vazio="Sem datas de nascimento."
        />
      </CartaoMetrica>
      <CartaoMetrica titulo="Profissões">
        <Barras
          itens={metricas.top_profissoes.map(({ chave, total }) => ({ rotulo: chave, total }))}
          vazio="Nenhuma profissão informada."
        />
      </CartaoMetrica>
    </div>
  );
}
