"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EstadoVazio } from "@/components/estado-vazio";
import { SeloStatus } from "@/components/selo-status";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { normalizarBusca } from "@/lib/busca";
import type { DadosProcesso, Processo } from "@/lib/processos-exemplo";
import { FormularioProcesso } from "./formulario-processo";

const linkLinha =
  "font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset";

const PREFIXO_NOVO = "novo-";

const processoEmBranco: DadosProcesso = {
  cnj: "",
  partes: "",
  area: "Cível e consumidor",
  tribunal: "",
  vara: "",
};

function LinkProcesso({ id, children }: { id: string; children: string }) {
  if (id.startsWith(PREFIXO_NOVO)) return <span className="font-medium">{children}</span>;
  return (
    <Link href={`/app/processos/${id}`} className={linkLinha}>
      {children}
    </Link>
  );
}

function CartoesProcessos({ processos }: { processos: Processo[] }) {
  return (
    <ul className="flex flex-col md:hidden">
      {processos.map(({ id, cnj, partes, area, tribunal, proximoPrazo, status }) => (
        <li
          key={id}
          className="relative flex flex-col gap-1 border-b p-3 text-sm transition-colors last:border-b-0 hover:bg-muted/50"
        >
          <LinkProcesso id={id}>{partes}</LinkProcesso>
          <span className="text-xs break-all text-texto-secundario tabular-nums">{cnj}</span>
          <span>
            {area} · {tribunal}
          </span>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="tabular-nums">
              {proximoPrazo ? `Próximo prazo: ${proximoPrazo}` : "Sem prazo em aberto"}
            </span>
            <SeloStatus status={status} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function TabelaProcessos({ processos }: { processos: Processo[] }) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Partes</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Tribunal</TableHead>
            <TableHead>Próximo prazo</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processos.map(({ id, cnj, partes, area, tribunal, proximoPrazo, status }) => (
            <TableRow key={id} className="relative">
              <TableCell className="tabular-nums">
                <LinkProcesso id={id}>{cnj}</LinkProcesso>
              </TableCell>
              <TableCell>{partes}</TableCell>
              <TableCell>{area}</TableCell>
              <TableCell>{tribunal}</TableCell>
              <TableCell className="tabular-nums">{proximoPrazo ?? "—"}</TableCell>
              <TableCell>
                <SeloStatus status={status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

type ListaProcessosProps = {
  processosIniciais: Processo[];
  novoProcesso: boolean;
};

export function ListaProcessos({ processosIniciais, novoProcesso }: ListaProcessosProps) {
  const router = useRouter();
  const [processos, setProcessos] = useState(processosIniciais);
  const [busca, setBusca] = useState("");
  const termo = normalizarBusca(busca.trim());
  const visiveis = processos.filter(({ cnj, partes }) =>
    normalizarBusca(`${cnj} ${partes}`).includes(termo),
  );

  function fecharNovo() {
    router.replace("/app/processos", { scroll: false });
  }

  function salvarNovo(dados: DadosProcesso) {
    const novo: Processo = {
      ...dados,
      id: `${PREFIXO_NOVO}${crypto.randomUUID()}`,
      proximoPrazo: null,
      prazos: [],
      status: "nao_iniciado",
      eventos: [],
    };
    setProcessos((atuais) => [novo, ...atuais]);
    fecharNovo();
    toast.success("Processo adicionado neste exemplo. Nada foi enviado.");
  }

  return (
    <div className="flex flex-col gap-4">
      <Dialog
        open={novoProcesso}
        onOpenChange={(aberto) => {
          if (!aberto) fecharNovo();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo processo</DialogTitle>
            <DialogDescription>Informe os dados principais do processo.</DialogDescription>
          </DialogHeader>
          <FormularioProcesso dados={processoEmBranco} aoSalvar={salvarNovo} />
        </DialogContent>
      </Dialog>
      <div className="flex flex-col gap-1 sm:max-w-md">
        <Label htmlFor="busca-processos">Buscar por número ou parte</Label>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-texto-secundario"
          />
          <Input
            id="busca-processos"
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      {visiveis.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum processo encontrado"
          descricao="Confira o número ou o nome da parte."
          acao={
            <Button variant="outline" onClick={() => setBusca("")}>
              Limpar busca
            </Button>
          }
        />
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <CartoesProcessos processos={visiveis} />
          <TabelaProcessos processos={visiveis} />
        </Card>
      )}
    </div>
  );
}
