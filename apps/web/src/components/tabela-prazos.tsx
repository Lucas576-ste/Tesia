import Link from "next/link";
import type { ReactNode } from "react";
import { SeloStatus } from "@/components/selo-status";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROTULOS_ETAPA } from "@/lib/etapas-prazo";
import { destinoPrazo, type LinhaPrazo, type StatusPrazo } from "@/lib/prazo";
import { prazoInternoVencido } from "@/lib/prazo-interno";
import { TIPOS_MANUAIS } from "@/lib/prazo-manual";
import { cn } from "@/lib/utils";

export function diasRestantes(diasUteis: number, status: StatusPrazo) {
  if (status === "protocolado") return { texto: "—", cor: "text-texto-secundario" };
  if (diasUteis === 0) return { texto: "Hoje", cor: "font-medium text-erro" };
  if (diasUteis === 1) return { texto: "Amanhã", cor: "font-medium text-erro" };
  if (diasUteis <= 3) return { texto: `${diasUteis} dias úteis`, cor: "font-medium text-atencao" };
  return { texto: `${diasUteis} dias úteis`, cor: "text-texto" };
}

export function TituloPrazo({ prazo }: { prazo: LinhaPrazo }) {
  const href = destinoPrazo(prazo);
  if (!href) return <span className="font-medium">{prazo.partes}</span>;
  return (
    <Link
      href={href}
      draggable={false}
      className="font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
    >
      {prazo.partes}
    </Link>
  );
}

export function DescricaoPrazo({
  prazo: { peca, tipo, responsavel, etapa },
}: {
  prazo: LinhaPrazo;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      {peca}
      {tipo && <Badge variant="secondary">{TIPOS_MANUAIS[tipo]}</Badge>}
      {etapa && !responsavel && (
        <span className="text-xs font-medium text-atencao">Sem responsável</span>
      )}
      {responsavel && (
        <span className="text-xs text-texto-secundario">
          {etapa ? ROTULOS_ETAPA[etapa] : "Responsável"}: {responsavel}
        </span>
      )}
    </span>
  );
}

export function VencimentoPrazo({ prazo: { vencimento, hora } }: { prazo: LinhaPrazo }) {
  return (
    <span className="tabular-nums">
      {vencimento}
      {hora && ` às ${hora}`}
    </span>
  );
}

export function PrazoInterno({ prazo, rotulo }: { prazo: LinhaPrazo; rotulo?: string }) {
  if (!prazo.prazoInterno) return <span className="text-texto-secundario">—</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 text-texto-secundario tabular-nums">
      <span>
        {rotulo && `${rotulo}: `}
        {prazo.prazoInterno}
      </span>
      {prazoInternoVencido(prazo) && (
        <span className="text-xs font-medium text-atencao">Interno vencido</span>
      )}
    </span>
  );
}

export function DatasPrazo({ prazo }: { prazo: LinhaPrazo }) {
  const ehPrazo = !prazo.tipo || prazo.tipo === "prazo";
  return (
    <span className="flex flex-col gap-0.5">
      <span>
        <span className="text-texto-secundario">{ehPrazo ? "Fatal" : "Data"}: </span>
        <span className="font-medium">
          <VencimentoPrazo prazo={prazo} />
        </span>
      </span>
      {prazo.prazoInterno && <PrazoInterno prazo={prazo} rotulo="Interno" />}
    </span>
  );
}

type TabelaPrazosProps = {
  prazos: LinhaPrazo[];
  acoes?: (prazo: LinhaPrazo) => ReactNode;
};

function ListaPrazos({ prazos, acoes }: TabelaPrazosProps) {
  return (
    <ul className="flex flex-col xl:hidden">
      {prazos.map((prazo) => {
        const { id, cnj, diasUteis, status, tipo } = prazo;
        const dias = diasRestantes(diasUteis, status);
        return (
          <li
            key={id}
            className="relative flex flex-col gap-1 border-b p-3 pr-12 text-sm transition-colors last:border-b-0 hover:bg-muted/50"
          >
            <TituloPrazo prazo={prazo} />
            {cnj && (
              <span className="text-xs break-all text-texto-secundario tabular-nums">{cnj}</span>
            )}
            <DescricaoPrazo prazo={prazo} />
            <DatasPrazo prazo={prazo} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={cn("tabular-nums", dias.cor)}>{dias.texto}</span>
              <SeloStatus status={status} manual={Boolean(tipo)} />
            </div>
            {acoes && <div className="absolute top-2 right-2 z-10">{acoes(prazo)}</div>}
          </li>
        );
      })}
    </ul>
  );
}

export function TabelaPrazos({ prazos, acoes }: TabelaPrazosProps) {
  return (
    <>
      <ListaPrazos prazos={prazos} acoes={acoes} />
      <div className="hidden xl:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Processo</TableHead>
              <TableHead>Peça</TableHead>
              <TableHead>Prazo fatal</TableHead>
              <TableHead>Prazo interno</TableHead>
              <TableHead>Dias restantes</TableHead>
              <TableHead>Status</TableHead>
              {acoes && (
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {prazos.map((prazo) => {
              const { id, cnj, diasUteis, status, tipo } = prazo;
              const dias = diasRestantes(diasUteis, status);
              return (
                <TableRow key={id} className="relative">
                  <TableCell>
                    <TituloPrazo prazo={prazo} />
                    <span className="block text-xs text-texto-secundario tabular-nums">{cnj}</span>
                  </TableCell>
                  <TableCell>
                    <DescricaoPrazo prazo={prazo} />
                  </TableCell>
                  <TableCell className="font-medium">
                    <VencimentoPrazo prazo={prazo} />
                  </TableCell>
                  <TableCell>
                    <PrazoInterno prazo={prazo} />
                  </TableCell>
                  <TableCell className={cn("tabular-nums", dias.cor)}>{dias.texto}</TableCell>
                  <TableCell>
                    <SeloStatus status={status} manual={Boolean(tipo)} />
                  </TableCell>
                  {acoes && <TableCell className="relative z-10 w-px">{acoes(prazo)}</TableCell>}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
