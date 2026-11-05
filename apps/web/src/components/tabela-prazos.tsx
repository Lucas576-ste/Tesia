import Link from "next/link";
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

export function TabelaPrazos({ prazos }: { prazos: LinhaPrazo[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Processo</TableHead>
          <TableHead>Peça</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Dias restantes</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prazos.map(({ id, partes, cnj, peca, vencimento, diasUteis, status }) => {
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
