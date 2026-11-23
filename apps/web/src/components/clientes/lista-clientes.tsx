"use client";

import {
  CODIGOS_ORIGEM,
  CODIGOS_PAPEL,
  mascararDocumento,
  ORIGENS,
  PAPEIS,
  tituloNome,
} from "@tesia/shared";
import { ArrowDown, ArrowUp, FolderPlus, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { excluirCliente, restaurarCliente } from "@/app/app/clientes/acoes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectNativo } from "@/components/ui/select-nativo";
import {
  urlDaLista,
  type FiltrosLista,
  type LinhaCliente,
  type PaginaClientes,
} from "@/lib/clientes-lista";
import { AvatarCliente } from "./avatar-cliente";
import { useDrawerCliente } from "./provedor-cliente";

type ListaClientesProps = { pagina: PaginaClientes; filtros: FiltrosLista };

function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function LinhaDaLista({
  cliente,
  excluidos,
  aoExcluir,
  aoRestaurar,
}: {
  cliente: LinhaCliente;
  excluidos: boolean;
  aoExcluir: (cliente: LinhaCliente) => void;
  aoRestaurar: (cliente: LinhaCliente) => void;
}) {
  const { abrirEdicao } = useDrawerCliente();
  const nome = tituloNome(cliente.nome);
  const local = [cliente.cidade, cliente.uf].filter(Boolean).join("/");

  return (
    <li className="group flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0 hover:bg-muted/40 focus-within:bg-muted/40">
      <AvatarCliente nome={nome} className="size-9" />
      <div className="grid min-w-0 flex-1 gap-x-4 gap-y-0.5 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="flex min-w-0 flex-col">
          <span className="flex min-w-0 items-center gap-2">
            {excluidos ? (
              <span className="truncate font-medium text-texto-secundario">{nome}</span>
            ) : (
              <Link
                href={`/app/clientes/${cliente.id}`}
                className="truncate font-medium text-titulo hover:underline"
              >
                {nome}
              </Link>
            )}
            {cliente.papel !== "cliente" && (
              <Badge variant="secondary" className="shrink-0">
                {PAPEIS[cliente.papel]}
              </Badge>
            )}
          </span>
          <span className="truncate text-xs text-texto-secundario">
            {cliente.documento
              ? mascararDocumento(cliente.documento, cliente.tipo_pessoa)
              : "Sem documento"}{" "}
            · {ORIGENS[cliente.origem]}
          </span>
        </div>
        <div className="flex min-w-0 flex-col text-xs text-texto-secundario">
          <span className="truncate">{cliente.email ?? "Sem e-mail"}</span>
          <span className="truncate">{cliente.telefone ?? "Sem celular"}</span>
        </div>
        <span className="truncate text-xs text-texto-secundario">{local || "Sem cidade"}</span>
        <span className="text-xs text-texto-secundario">
          {cliente.processos === 1 ? "1 processo" : `${cliente.processos} processos`} · desde{" "}
          {dataCurta(cliente.criado_em)}
        </span>
      </div>
      <div className="flex shrink-0 gap-0.5 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
        {excluidos ? (
          <Button variant="outline" size="sm" onClick={() => aoRestaurar(cliente)}>
            <RotateCcw aria-hidden />
            Restaurar
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar ${nome}`}
              onClick={() => abrirEdicao(cliente.id)}
            >
              <Pencil aria-hidden />
            </Button>
            <Button asChild variant="ghost" size="icon-sm">
              <Link
                href={`/app/clientes?aba=processos&novo=1&cliente=${cliente.id}`}
                aria-label={`Novo processo de ${nome}`}
              >
                <FolderPlus aria-hidden />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Excluir ${nome}`}
              onClick={() => aoExcluir(cliente)}
            >
              <Trash2 aria-hidden />
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

export function ListaClientes({ pagina, filtros }: ListaClientesProps) {
  const router = useRouter();
  const [busca, setBusca] = useState(filtros.busca);
  const [excluindo, setExcluindo] = useState<LinhaCliente | null>(null);
  const [processando, iniciar] = useTransition();

  useEffect(() => {
    if (busca.trim() === filtros.busca) return;
    const espera = setTimeout(() => {
      router.replace(urlDaLista(filtros, { busca: busca.trim(), pagina: 1 }), { scroll: false });
    }, 350);
    return () => clearTimeout(espera);
  }, [busca, filtros, router]);

  function ir(mudar: Partial<FiltrosLista>) {
    router.replace(urlDaLista(filtros, { pagina: 1, ...mudar }), { scroll: false });
  }

  function excluir() {
    const alvo = excluindo;
    if (!alvo) return;
    iniciar(async () => {
      const resultado = await excluirCliente(alvo.id);
      setExcluindo(null);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Cliente excluído.", {
        action: {
          label: "Desfazer",
          onClick: async () => {
            const desfeito = await restaurarCliente(alvo.id);
            if ("erro" in desfeito) toast.error(desfeito.erro);
            router.refresh();
          },
        },
      });
      router.refresh();
    });
  }

  function restaurar(cliente: LinhaCliente) {
    iniciar(async () => {
      const resultado = await restaurarCliente(cliente.id);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Cliente restaurado.");
      router.refresh();
    });
  }

  const { linhas, total, pagina: atual, paginas } = pagina;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative min-w-52 flex-1 sm:max-w-sm">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-texto-secundario"
          />
          <Input
            type="search"
            aria-label="Buscar por nome, documento, e-mail ou #hashtag"
            placeholder="Nome, documento, e-mail ou #hashtag"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            className="pl-8"
          />
        </div>
        <SelectNativo
          aria-label="Filtrar por papel"
          value={filtros.papel ?? ""}
          onChange={(evento) =>
            ir({ papel: (evento.target.value || undefined) as FiltrosLista["papel"] })
          }
          className="w-auto"
        >
          <option value="">Todos os papéis</option>
          {CODIGOS_PAPEL.map((codigo) => (
            <option key={codigo} value={codigo}>
              {PAPEIS[codigo]}
            </option>
          ))}
        </SelectNativo>
        <SelectNativo
          aria-label="Filtrar por origem"
          value={filtros.origem ?? ""}
          onChange={(evento) =>
            ir({ origem: (evento.target.value || undefined) as FiltrosLista["origem"] })
          }
          className="w-auto"
        >
          <option value="">Todas as origens</option>
          {CODIGOS_ORIGEM.map((codigo) => (
            <option key={codigo} value={codigo}>
              {ORIGENS[codigo]}
            </option>
          ))}
        </SelectNativo>
        <SelectNativo
          aria-label="Ordenar por"
          value={filtros.ordem}
          onChange={(evento) => ir({ ordem: evento.target.value as FiltrosLista["ordem"] })}
          className="w-auto"
        >
          <option value="nome">Ordenar por nome</option>
          <option value="cidade">Ordenar por cidade</option>
          <option value="cadastro">Ordenar por cadastro</option>
        </SelectNativo>
        <Button
          variant="outline"
          size="icon"
          aria-label={filtros.direcao === "asc" ? "Ordem crescente" : "Ordem decrescente"}
          onClick={() => ir({ direcao: filtros.direcao === "asc" ? "desc" : "asc" })}
        >
          {filtros.direcao === "asc" ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />}
        </Button>
        <label className="flex h-9 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filtros.excluidos}
            onChange={(evento) => ir({ excluidos: evento.target.checked })}
          />
          Mostrar excluídos
        </label>
      </div>
      {linhas.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-sm text-texto-secundario">
          {filtros.excluidos
            ? "Nenhum cliente excluído."
            : "Nenhum cliente encontrado com esses filtros."}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-xl border bg-card shadow-card">
          {linhas.map((cliente) => (
            <LinhaDaLista
              key={cliente.id}
              cliente={cliente}
              excluidos={filtros.excluidos}
              aoExcluir={setExcluindo}
              aoRestaurar={restaurar}
            />
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-texto-secundario">
        <span>
          {total === 1 ? "1 cliente" : `${total} clientes`} · página {atual} de {paginas}
        </span>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" disabled={atual <= 1}>
            <Link
              href={urlDaLista(filtros, { pagina: Math.max(1, atual - 1) })}
              aria-disabled={atual <= 1}
              tabIndex={atual <= 1 ? -1 : undefined}
            >
              Anterior
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" disabled={atual >= paginas}>
            <Link
              href={urlDaLista(filtros, { pagina: Math.min(paginas, atual + 1) })}
              aria-disabled={atual >= paginas}
              tabIndex={atual >= paginas ? -1 : undefined}
            >
              Próxima
            </Link>
          </Button>
        </div>
      </div>
      <Dialog open={Boolean(excluindo)} onOpenChange={(aberto) => !aberto && setExcluindo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir {excluindo ? tituloNome(excluindo.nome) : "cliente"}?</DialogTitle>
            <DialogDescription>
              O cliente sai da lista, mas os processos dele continuam. Você pode restaurar depois,
              em &ldquo;Mostrar excluídos&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExcluindo(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={excluir} disabled={processando}>
              {processando ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
