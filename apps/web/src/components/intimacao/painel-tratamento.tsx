"use client";

import { podeDesvincularProcesso, type PapelUsuario } from "@tesia/shared";
import { CheckCheck, EyeOff, ListPlus, Mail, Send, Undo2, Unlink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { criarPrazoManual } from "@/app/app/acoes-prazos";
import {
  desvincularProcesso,
  encaminharIntimacoes,
  tratarIntimacoes,
} from "@/app/app/intimacoes/tratamento-acoes";
import { ModalPrazoManual } from "@/components/painel/modal-prazo-manual";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectNativo } from "@/components/ui/select-nativo";
import { isoParaData } from "@/lib/prazo-interno";
import type { PrazoManual, ProcessoResumo } from "@/lib/prazo-manual";
import type { Responsavel } from "@/lib/termos";
import type { DadosTratamento } from "@/lib/tratamento-dados";
import { mailtoDaIntimacao, podeTratarIntimacao } from "@/lib/tratamento-intimacao";
import { DialogoConcluir } from "./dialogo-concluir";
import { DialogoNovoProcesso, DialogoVincularProcesso } from "./dialogos-processo-intimacao";

type PainelTratamentoProps = {
  dados: DadosTratamento;
  processos: ProcessoResumo[];
  responsaveis: Responsavel[];
  usuario: { id: string; papel: PapelUsuario };
};

type Janela = "tarefa" | "vincular" | "novo" | "encaminhar" | "desvincular" | "concluir" | null;

function formatoData(iso: string) {
  return isoParaData(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso)),
  );
}

export function PainelTratamento({
  dados,
  processos,
  responsaveis,
  usuario,
}: PainelTratamentoProps) {
  const router = useRouter();
  const [janela, setJanela] = useState<Janela>(null);
  const [destino, setDestino] = useState("");
  const [ocupado, iniciar] = useTransition();
  const pendente = dados.tratamento === "pendente";
  const podeTratar = podeTratarIntimacao(dados.responsavelId, usuario.id);

  const fechar = () => setJanela(null);
  const atualizar = () => {
    fechar();
    router.refresh();
  };

  function tratar(acao: "concluir" | "ignorar" | "reabrir", cumprirPrazo = false) {
    iniciar(async () => {
      const resultado = await tratarIntimacoes([dados.id], acao, { cumprirPrazo });
      if ("erro" in resultado) return void toast.error(resultado.erro);
      if (resultado.feitas === 0) {
        return void toast.error(
          `Só ${dados.responsavelNome ?? "o responsável"} pode tratar esta intimação.`,
        );
      }
      toast.success(
        acao === "concluir"
          ? "Intimação concluída."
          : acao === "ignorar"
            ? "Intimação ignorada."
            : "Intimação reaberta.",
      );
      if (acao === "reabrir") router.refresh();
      else router.push("/app/intimacoes");
    });
  }

  function encaminhar() {
    if (!destino) return;
    iniciar(async () => {
      const resultado = await encaminharIntimacoes([dados.id], destino);
      if ("erro" in resultado) return void toast.error(resultado.erro);
      if (resultado.feitas === 0)
        return void toast.error(`Só ${dados.responsavelNome ?? "o responsável"} pode encaminhar.`);
      toast.success("Intimação encaminhada.");
      atualizar();
    });
  }

  function desvincular() {
    iniciar(async () => {
      const resultado = await desvincularProcesso(dados.id);
      if ("erro" in resultado) return void toast.error(resultado.erro);
      toast.success("Processo desvinculado.");
      atualizar();
    });
  }

  async function criarTarefa(tarefa: PrazoManual) {
    const criada = await criarPrazoManual(tarefa);
    if ("erro" in criada) return void toast.error(criada.erro);
    fechar();
    if (!podeTratar) {
      toast.success(
        `Tarefa criada. Só ${dados.responsavelNome ?? "o responsável"} conclui a intimação.`,
      );
      return router.refresh();
    }
    const conclusao = await tratarIntimacoes([dados.id], "concluir");
    if ("erro" in conclusao) {
      toast.error("A tarefa foi criada, mas não foi possível concluir a intimação.");
      return router.refresh();
    }
    toast.success("Tarefa criada e intimação concluída.");
    router.push("/app/intimacoes");
  }

  const email = mailtoDaIntimacao({
    numeroProcesso: dados.numeroProcesso,
    tribunal: dados.tribunal,
    publicadaEm: dados.publicadaEm,
    texto: dados.texto,
  });

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-lg font-semibold">Tratar esta intimação</h2>
        {!pendente && (
          <p className="flex items-center gap-1.5 text-sm text-texto-secundario">
            {dados.tratamento === "concluida" ? (
              <CheckCheck aria-hidden className="size-4 text-sucesso" />
            ) : (
              <EyeOff aria-hidden className="size-4" />
            )}
            {dados.tratamento === "concluida" ? "Concluída" : "Ignorada"}
            {dados.tratadaPor && ` por ${dados.tratadaPor}`}
            {dados.tratadaEm && ` em ${formatoData(dados.tratadaEm)}`}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <p className="text-texto-secundario">
          Responsável: {dados.responsavelNome ?? "ninguém definido"}
          {dados.termo && ` · Termo: ${dados.termo}`}
        </p>
        {dados.processo ? (
          <p className="flex flex-wrap items-center gap-2">
            <span>
              Processo:{" "}
              <Link href={`/app/processos/${dados.processo.id}`} className="font-medium underline">
                {dados.processo.cnj}
              </Link>{" "}
              · {dados.processo.partes}
            </span>
            {podeDesvincularProcesso(usuario.papel) && (
              <Button
                size="sm"
                variant="ghost"
                disabled={ocupado}
                onClick={() => setJanela("desvincular")}
              >
                <Unlink aria-hidden />
                Desvincular
              </Button>
            )}
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-texto-secundario">Sem processo vinculado.</span>
            <Button size="sm" variant="outline" onClick={() => setJanela("novo")}>
              Cadastrar novo processo
            </Button>
            <Button size="sm" variant="outline" onClick={() => setJanela("vincular")}>
              Vincular a processo existente
            </Button>
          </div>
        )}
      </div>

      {dados.inicioProvavel && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="font-medium">
            Início provável da contagem: {isoParaData(dados.inicioProvavel.inicioIso)}
          </p>
          <ul className="mt-1 list-disc pl-5 text-xs text-texto-secundario">
            {dados.inicioProvavel.memoria.slice(0, -1).map((linha) => (
              <li key={linha}>{linha}</li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-texto-secundario">
            Só uma referência. O prazo final só vale depois que você confirmar.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {pendente ? (
          <>
            <Button variant="outline" disabled={ocupado} onClick={() => setJanela("tarefa")}>
              <ListPlus aria-hidden />
              Atribuir nova tarefa
            </Button>
            {responsaveis.length > 1 && (
              <Button variant="outline" disabled={ocupado} onClick={() => setJanela("encaminhar")}>
                <Send aria-hidden />
                Encaminhar
              </Button>
            )}
            <Button asChild variant="outline">
              <a href={email}>
                <Mail aria-hidden />
                Enviar por e-mail
              </a>
            </Button>
            <Button
              variant="outline"
              disabled={ocupado || !podeTratar}
              onClick={() => (dados.prazoConfirmado ? setJanela("concluir") : tratar("concluir"))}
            >
              <CheckCheck aria-hidden />
              Concluir
            </Button>
            <Button
              variant="outline"
              disabled={ocupado || !podeTratar}
              onClick={() => tratar("ignorar")}
            >
              <EyeOff aria-hidden />
              Ignorar
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            disabled={ocupado || !podeTratar}
            onClick={() => tratar("reabrir")}
          >
            <Undo2 aria-hidden />
            Reabrir
          </Button>
        )}
      </div>
      {!podeTratar && (
        <p className="text-xs text-texto-secundario">
          Só {dados.responsavelNome ?? "o responsável"} conclui, ignora ou reabre esta intimação.
        </p>
      )}

      {dados.prazoConfirmado && (
        <DialogoConcluir
          aberto={janela === "concluir"}
          prazo={dados.prazoConfirmado}
          ocupado={ocupado}
          aoFechar={fechar}
          aoConcluir={(cumprirPrazo) => tratar("concluir", cumprirPrazo)}
        />
      )}
      <ModalPrazoManual
        aberto={janela === "tarefa"}
        titulo="Atribuir nova tarefa"
        tipoInicial="compromisso"
        descricaoInicial={`Providenciar: ${dados.sugestaoProcesso.partes || dados.processo?.partes || "intimação"}`.slice(
          0,
          120,
        )}
        processoInicial={dados.processo?.id}
        processos={processos}
        responsaveis={responsaveis}
        responsavelInicial={dados.responsavelId ?? usuario.id}
        comObservacoes
        aoFechar={fechar}
        aoSalvar={criarTarefa}
      />
      <DialogoVincularProcesso
        aberto={janela === "vincular"}
        intimacaoId={dados.id}
        aoFechar={fechar}
        aoVincular={atualizar}
      />
      <DialogoNovoProcesso
        aberto={janela === "novo"}
        intimacaoId={dados.id}
        sugestao={dados.sugestaoProcesso}
        aoFechar={fechar}
        aoVincular={atualizar}
      />
      <Dialog open={janela === "encaminhar"} onOpenChange={(valor) => !valor && fechar()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encaminhar intimação</DialogTitle>
            <DialogDescription>
              A pessoa escolhida passa a ser a responsável e é avisada.
            </DialogDescription>
          </DialogHeader>
          <SelectNativo
            aria-label="Encaminhar para"
            value={destino}
            onChange={(evento) => setDestino(evento.target.value)}
          >
            <option value="">Escolha uma pessoa</option>
            {responsaveis
              .filter(({ id }) => id !== dados.responsavelId)
              .map(({ id, nome }) => (
                <option key={id} value={id}>
                  {nome}
                </option>
              ))}
          </SelectNativo>
          <DialogFooter>
            <Button variant="outline" onClick={fechar}>
              Cancelar
            </Button>
            <Button disabled={ocupado || !destino} onClick={encaminhar}>
              Encaminhar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={janela === "desvincular"} onOpenChange={(valor) => !valor && fechar()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desvincular o processo?</DialogTitle>
            <DialogDescription>
              A intimação deixa de aparecer no processo. Você pode vincular de novo depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={fechar}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={ocupado} onClick={desvincular}>
              Desvincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
