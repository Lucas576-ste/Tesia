"use client";

import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { EstadoVazio } from "@/components/estado-vazio";
import { SeloStatus } from "@/components/selo-status";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LinhaPeca } from "@/lib/pecas-exemplo";
import { cn } from "@/lib/utils";
import { MenuAcoesPeca } from "./menu-acoes-peca";

const FILTRO_PADRAO = { tipo: "todos", area: "todas", status: "todos" };

type Filtro = typeof FILTRO_PADRAO;

const linkLinha =
  "font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset";

function unicos(valores: string[]) {
  return [...new Set(valores)].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function titulo({ tipo, partes }: LinhaPeca) {
  return `${tipo} · ${partes}`;
}

type CampoFiltroProps = {
  id: keyof Filtro;
  rotulo: string;
  valor: string;
  aoMudar: (campo: keyof Filtro, valor: string) => void;
  children: ReactNode;
};

function CampoFiltro({ id, rotulo, valor, aoMudar, children }: CampoFiltroProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={`filtro-${id}`}>{rotulo}</Label>
      <SelectNativo
        id={`filtro-${id}`}
        value={valor}
        onChange={(evento) => aoMudar(id, evento.target.value)}
      >
        {children}
      </SelectNativo>
    </div>
  );
}

function CartoesPecas({ pecas }: { pecas: LinhaPeca[] }) {
  return (
    <ul className="flex flex-col md:hidden">
      {pecas.map((peca) => (
        <li
          key={peca.id}
          className="relative flex flex-col gap-1 border-b p-3 pr-12 text-sm transition-colors last:border-b-0 hover:bg-muted/50"
        >
          <Link href={`/app/pecas/${peca.id}`} className={linkLinha}>
            {titulo(peca)}
          </Link>
          <span className="text-xs break-all text-texto-secundario tabular-nums">{peca.cnj}</span>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="tabular-nums">{peca.data}</span>
            <SeloStatus status={peca.status} />
          </div>
          <div className="absolute top-2 right-2 z-10">
            <MenuAcoesPeca peca={peca} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function TabelaPecas({ pecas }: { pecas: LinhaPeca[] }) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Processo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pecas.map((peca) => (
            <TableRow key={peca.id} className="relative">
              <TableCell>
                <Link href={`/app/pecas/${peca.id}`} className={linkLinha}>
                  {titulo(peca)}
                </Link>
              </TableCell>
              <TableCell className="tabular-nums">{peca.cnj}</TableCell>
              <TableCell>{peca.tipo}</TableCell>
              <TableCell className="tabular-nums">{peca.data}</TableCell>
              <TableCell>
                <SeloStatus status={peca.status} />
              </TableCell>
              <TableCell className="relative z-10 w-px">
                <MenuAcoesPeca peca={peca} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ListaPecas({ pecas }: { pecas: LinhaPeca[] }) {
  const [filtro, setFiltro] = useState(FILTRO_PADRAO);
  const [aberto, setAberto] = useState(false);

  const ativos = [
    filtro.tipo !== FILTRO_PADRAO.tipo,
    filtro.area !== FILTRO_PADRAO.area,
    filtro.status !== FILTRO_PADRAO.status,
  ].filter(Boolean).length;

  const visiveis = pecas.filter(
    ({ tipo, area, status }) =>
      (filtro.tipo === FILTRO_PADRAO.tipo || tipo === filtro.tipo) &&
      (filtro.area === FILTRO_PADRAO.area || area === filtro.area) &&
      (filtro.status === FILTRO_PADRAO.status || status === filtro.status),
  );

  function aoMudar(campo: keyof Filtro, valor: string) {
    setFiltro((atual) => ({ ...atual, [campo]: valor }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          aria-expanded={aberto}
          aria-controls="filtros-pecas"
          onClick={() => setAberto((atual) => !atual)}
          className="sm:hidden"
        >
          <SlidersHorizontal aria-hidden />
          {ativos > 0 ? `Filtros (${ativos})` : "Filtros"}
        </Button>
        <div
          id="filtros-pecas"
          className={cn(
            "items-end gap-3 sm:grid sm:grid-cols-[1fr_1fr_1fr_auto]",
            aberto ? "grid" : "hidden",
          )}
        >
          <CampoFiltro id="tipo" rotulo="Tipo" valor={filtro.tipo} aoMudar={aoMudar}>
            <option value="todos">Todos</option>
            {unicos(pecas.map(({ tipo }) => tipo)).map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </CampoFiltro>
          <CampoFiltro id="area" rotulo="Área" valor={filtro.area} aoMudar={aoMudar}>
            <option value="todas">Todas</option>
            {unicos(pecas.map(({ area }) => area)).map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </CampoFiltro>
          <CampoFiltro id="status" rotulo="Status" valor={filtro.status} aoMudar={aoMudar}>
            <option value="todos">Todos</option>
            <option value="rascunho_pronto">Rascunho pronto</option>
            <option value="protocolado">Protocolado</option>
          </CampoFiltro>
          <Button variant="ghost" disabled={ativos === 0} onClick={() => setFiltro(FILTRO_PADRAO)}>
            Limpar filtros
          </Button>
        </div>
      </div>
      {visiveis.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma peça com esses filtros"
          descricao="Tente limpar um dos filtros."
          acao={
            <Button variant="outline" onClick={() => setFiltro(FILTRO_PADRAO)}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <CartoesPecas pecas={visiveis} />
          <TabelaPecas pecas={visiveis} />
        </Card>
      )}
    </div>
  );
}
