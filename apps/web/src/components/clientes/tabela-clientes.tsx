"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ClienteResumo } from "@/lib/clientes";
import { resumoCliente, textoHaDias, type ResumoCliente } from "@/lib/resumo-cliente";
import { AvatarCliente } from "./avatar-cliente";
import { SeloFase } from "./selo-fase";
import { SeloProximoPrazo } from "./selo-proximo-prazo";

type Coluna = "cliente" | "processos" | "fase" | "prazo" | "contato";

const COLUNAS: { id: Coluna; rotulo: string }[] = [
  { id: "cliente", rotulo: "Cliente" },
  { id: "processos", rotulo: "Processos" },
  { id: "fase", rotulo: "Fase" },
  { id: "prazo", rotulo: "Próximo prazo" },
  { id: "contato", rotulo: "Último contato" },
];

type Linha = { cliente: ClienteResumo; resumo: ResumoCliente };

function valor(linha: Linha, coluna: Coluna): string | number {
  const { resumo } = linha;
  if (coluna === "cliente") return resumo.nome;
  if (coluna === "processos") return resumo.total;
  if (coluna === "fase") return resumo.processoPrincipal?.nomeFase ?? "";
  if (coluna === "prazo") return resumo.proximoIso ?? "9999-12-31";
  return resumo.diasContato ?? Number.MAX_SAFE_INTEGER;
}

export function TabelaClientes({ clientes }: { clientes: ClienteResumo[] }) {
  const [ordem, setOrdem] = useState<{ coluna: Coluna; asc: boolean }>({
    coluna: "prazo",
    asc: true,
  });
  const linhas = clientes
    .map((cliente) => ({ cliente, resumo: resumoCliente(cliente) }))
    .sort((a, b) => {
      const x = valor(a, ordem.coluna);
      const y = valor(b, ordem.coluna);
      const comparacao =
        typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y), "pt-BR");
      return ordem.asc ? comparacao : -comparacao;
    });

  function ordenar(coluna: Coluna) {
    setOrdem((atual) => ({ coluna, asc: atual.coluna === coluna ? !atual.asc : true }));
  }

  return (
    <Card className="gap-0 overflow-x-auto py-0">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUNAS.map(({ id, rotulo }) => (
              <TableHead
                key={id}
                aria-sort={
                  ordem.coluna === id ? (ordem.asc ? "ascending" : "descending") : undefined
                }
              >
                <button
                  type="button"
                  onClick={() => ordenar(id)}
                  className="inline-flex items-center gap-1 font-semibold hover:text-texto"
                >
                  {rotulo}
                  {ordem.coluna === id &&
                    (ordem.asc ? (
                      <ArrowUp aria-hidden className="size-3.5" />
                    ) : (
                      <ArrowDown aria-hidden className="size-3.5" />
                    ))}
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map(({ cliente, resumo }) => (
            <TableRow key={cliente.id}>
              <TableCell>
                <Link
                  href={`/app/clientes/${cliente.id}`}
                  className="flex items-center gap-2 font-medium text-titulo hover:underline"
                >
                  <AvatarCliente nome={resumo.nome} className="size-7 text-xs" />
                  {resumo.nome}
                </Link>
              </TableCell>
              <TableCell className="text-texto-secundario">{resumo.textoProcessos}</TableCell>
              <TableCell>
                {resumo.processoPrincipal ? <SeloFase processo={resumo.processoPrincipal} /> : "—"}
              </TableCell>
              <TableCell>
                {resumo.proximo ? (
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums">{resumo.proximo.vencimento}</span>
                    <SeloProximoPrazo urgencia={resumo.proximo} />
                  </span>
                ) : (
                  <span className="text-texto-secundario">Nenhum</span>
                )}
              </TableCell>
              <TableCell className="text-texto-secundario">
                {textoHaDias(resumo.diasContato)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
