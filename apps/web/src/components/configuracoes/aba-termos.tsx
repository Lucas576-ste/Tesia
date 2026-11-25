"use client";

import { mascararDocumento } from "@tesia/shared";
import { Pause, Pencil, Play, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { criarTermo, excluirTermo, mudarSituacaoTermo } from "@/app/app/configuracoes/termos-acoes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { STATUS_TERMO, TIPOS_TERMO, type Responsavel, type Termo } from "@/lib/termos";
import { DialogoTermo } from "./dialogo-termo";

export type DadosTermos = {
  itens: Termo[];
  responsaveis: Responsavel[];
  podeGerenciar: boolean;
  usuarioId: string;
  minhaOab: { numero: string; uf: string } | null;
};

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function titulo(termo: Termo) {
  if (termo.tipo === "advogado") return `OAB ${termo.oab}`;
  const documento = termo.documento ? mascararDocumento(termo.documento, termo.tipo) : "";
  return `${termo.nome ?? ""} · ${documento}`;
}

function CartaoTermo({
  termo,
  podeGerenciar,
  aoEditar,
  aoExcluir,
}: {
  termo: Termo;
  podeGerenciar: boolean;
  aoEditar: () => void;
  aoExcluir: () => void;
}) {
  const [ocupado, iniciar] = useTransition();

  function mudar(acao: "pausar" | "retomar" | "sincronizar") {
    iniciar(async () => {
      const resultado = await mudarSituacaoTermo(termo.id, acao);
      if ("erro" in resultado) toast.error(resultado.erro);
      else
        toast.success(acao === "pausar" ? "Termo pausado." : "A busca recomeça em alguns minutos.");
    });
  }

  const pausado = termo.status === "inativo";
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium break-words">{titulo(termo)}</p>
          <p className="text-xs text-texto-secundario">
            {TIPOS_TERMO[termo.tipo]} · Responsável: {termo.responsavelNome ?? "sem responsável"} ·{" "}
            {termo.ufs.length ? termo.ufs.join(", ") : "Todos os estados"}
          </p>
        </div>
        <Badge variant={termo.status === "falha_autenticacao" ? "destructive" : "secondary"}>
          {STATUS_TERMO[termo.status]}
        </Badge>
      </div>
      <p className="text-xs text-texto-secundario">
        {termo.ultimaSincronizacao
          ? `Última busca: ${formatoData.format(new Date(termo.ultimaSincronizacao))}`
          : "Ainda não foi buscado."}
      </p>
      {termo.ultimoErro && (
        <p role="alert" className="text-xs text-erro">
          {termo.ultimoErro}
        </p>
      )}
      {podeGerenciar && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={ocupado}
            onClick={() => mudar(pausado ? "retomar" : "pausar")}
          >
            {pausado ? <Play aria-hidden /> : <Pause aria-hidden />}
            {pausado ? "Retomar" : "Pausar"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={ocupado}
            onClick={() => mudar("sincronizar")}
          >
            <RefreshCw aria-hidden />
            Buscar de novo
          </Button>
          <Button size="sm" variant="outline" onClick={aoEditar}>
            <Pencil aria-hidden />
            Editar
          </Button>
          <Button size="sm" variant="outline" onClick={aoExcluir}>
            <Trash2 aria-hidden />
            Excluir
          </Button>
        </div>
      )}
    </Card>
  );
}

function MonitorarMinhaOab({
  oab,
  usuarioId,
}: {
  oab: { numero: string; uf: string };
  usuarioId: string;
}) {
  const [criando, iniciar] = useTransition();

  function monitorar() {
    iniciar(async () => {
      const resultado = await criarTermo({
        tipo: "advogado",
        oabNumero: oab.numero,
        oabUf: oab.uf as never,
        ufs: [],
        responsavelId: usuarioId,
      });
      if ("erro" in resultado) toast.error(resultado.erro);
      else toast.success("Pronto. Vou buscar suas intimações algumas vezes por dia.");
    });
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 border-primaria p-4">
      <p className="max-w-xl text-sm">
        Sua OAB {oab.numero}/{oab.uf} ainda não está sendo monitorada. Ative para a Tesia trazer
        suas intimações dos diários e analisar sozinha.
      </p>
      <Button onClick={monitorar} disabled={criando}>
        {criando ? "Ativando..." : "Monitorar minha OAB"}
      </Button>
    </Card>
  );
}

function jaMonitoraOab(termos: DadosTermos) {
  if (!termos.minhaOab) return true;
  const numero = termos.minhaOab.numero.replace(/\D/g, "").replace(/^0+/, "");
  return termos.itens.some(
    ({ tipo, oab }) => tipo === "advogado" && oab === `${numero}/${termos.minhaOab?.uf}`,
  );
}

export function AbaTermos({ termos }: { termos: DadosTermos }) {
  const [dialogo, setDialogo] = useState<{ termo: Termo | null } | null>(null);
  const [aExcluir, setAExcluir] = useState<Termo | null>(null);
  const [excluindo, iniciar] = useTransition();

  function confirmarExclusao() {
    if (!aExcluir) return;
    iniciar(async () => {
      const resultado = await excluirTermo(aExcluir.id);
      if ("erro" in resultado) toast.error(resultado.erro);
      else toast.success("Termo excluído. As intimações já recebidas continuam na lista.");
      setAExcluir(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-xl text-sm text-texto-secundario">
          Termos que a Tesia monitora nos diários oficiais. Cada publicação nova vira uma intimação
          para tratar, ou um andamento no histórico do processo.
        </p>
        {termos.podeGerenciar && (
          <Button onClick={() => setDialogo({ termo: null })}>
            <Plus aria-hidden />
            Novo termo
          </Button>
        )}
      </div>
      {termos.podeGerenciar && termos.minhaOab && !jaMonitoraOab(termos) && (
        <MonitorarMinhaOab oab={termos.minhaOab} usuarioId={termos.usuarioId} />
      )}
      {!termos.podeGerenciar && (
        <p className="text-sm text-texto-secundario">
          Só o dono e os advogados do escritório cadastram e alteram termos.
        </p>
      )}
      {termos.itens.length === 0 ? (
        <Card className="p-4 text-sm text-texto-secundario">Nenhum termo cadastrado ainda.</Card>
      ) : (
        termos.itens.map((termo) => (
          <CartaoTermo
            key={termo.id}
            termo={termo}
            podeGerenciar={termos.podeGerenciar}
            aoEditar={() => setDialogo({ termo })}
            aoExcluir={() => setAExcluir(termo)}
          />
        ))
      )}
      {dialogo && (
        <DialogoTermo
          key={dialogo.termo?.id ?? "novo"}
          aberto
          termo={dialogo.termo}
          responsaveis={termos.responsaveis}
          responsavelPadrao={termos.usuarioId}
          aoFechar={() => setDialogo(null)}
        />
      )}
      <Dialog open={aExcluir !== null} onOpenChange={(valor) => !valor && setAExcluir(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir este termo?</DialogTitle>
            <DialogDescription>
              A Tesia para de buscar publicações com ele. As intimações já recebidas continuam na
              lista.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAExcluir(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={excluindo} onClick={confirmarExclusao}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
