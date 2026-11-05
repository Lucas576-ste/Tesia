import Link from "next/link";
import type { ReactNode } from "react";
import { SeloStatus } from "@/components/selo-status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { destinoPrazo, type LinhaPrazo, type StatusPrazo } from "@/lib/prazo";
import { cn } from "@/lib/utils";

function diasRestantes(diasUteis: number, status: StatusPrazo) {
  if (status === "protocolado") return { texto: "—", cor: "text-texto-secundario" };
  if (diasUteis === 0) return { texto: "Hoje", cor: "font-medium text-erro" };
  if (diasUteis === 1) return { texto: "Amanhã", cor: "font-medium text-erro" };
  if (diasUteis <= 3) return { texto: `${diasUteis} dias úteis`, cor: "font-medium text-atencao" };
  return { texto: `${diasUteis} dias úteis`, cor: "text-texto" };
}

type TabelaPrazosProps = {
  prazos: LinhaPrazo[];
  acoes?: (prazo: LinhaPrazo) => ReactNode;
};

function ListaPrazos({ prazos, acoes }: TabelaPrazosProps) {
  return (
    <ul className="flex flex-col md:hidden">
      {prazos.map((prazo) => {
        const { id, partes, cnj, peca, vencimento, diasUteis, status } = prazo;
        const dias = diasRestantes(diasUteis, status);
        return (
          <li
            key={id}
            className="relative flex flex-col gap-1 border-b p-3 pr-12 text-sm transition-colors last:border-b-0 hover:bg-muted/50"
          >
            <Link
              href={destinoPrazo({ id, status })}
              className="font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
            >
              {partes}
            </Link>
            <span className="text-xs break-all text-texto-secundario tabular-nums">{cnj}</span>
            <span>
              {peca} · <span className="tabular-nums">{vencimento}</span>
            </span>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={cn("tabular-nums", dias.cor)}>{dias.texto}</span>
              <SeloStatus status={status} />
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
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Processo</TableHead>
              <TableHead>Peça</TableHead>
              <TableHead>Vencimento</TableHead>
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
              const { id, partes, cnj, peca, vencimento, diasUteis, status } = prazo;
              const dias = diasRestantes(diasUteis, status);
              return (
                <TableRow key={id} className="relative">
                  <TableCell>
                    <Link
                      href={destinoPrazo({ id, status })}
                      className="font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
                    >
                      {partes}
                    </Link>
                    <span className="block text-xs text-texto-secundario tabular-nums">{cnj}</span>
                  </TableCell>
                  <TableCell>{peca}</TableCell>
                  <TableCell className="tabular-nums">{vencimento}</TableCell>
                  <TableCell className={cn("tabular-nums", dias.cor)}>{dias.texto}</TableCell>
                  <TableCell>
                    <SeloStatus status={status} />
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
