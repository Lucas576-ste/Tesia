"use client";

import { CheckCheck, ListPlus, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { criarPrazoManual } from "@/app/app/acoes-prazos";
import { concluirIntimacao } from "@/app/app/intimacoes/acoes";
import { ModalPrazoManual } from "@/components/painel/modal-prazo-manual";
import { Button } from "@/components/ui/button";
import type { PrazoManual, ProcessoResumo } from "@/lib/prazo-manual";

type TratarIntimacaoProps = {
  intimacaoId: string;
  partes: string;
  concluida: boolean;
  processoId: string | null;
  processos: ProcessoResumo[];
};

export function TratarIntimacao({
  intimacaoId,
  partes,
  concluida,
  processoId,
  processos,
}: TratarIntimacaoProps) {
  const router = useRouter();
  const [tarefaAberta, setTarefaAberta] = useState(false);
  const [ocupado, iniciar] = useTransition();

  function alterar(valor: boolean) {
    iniciar(async () => {
      const resultado = await concluirIntimacao(intimacaoId, valor);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      if (valor) {
        toast.success("Intimação concluída.");
        router.push("/app/intimacoes");
        return;
      }
      toast.success("Intimação reaberta.");
      router.refresh();
    });
  }

  async function criarTarefa(dados: PrazoManual) {
    const criada = await criarPrazoManual(dados);
    if ("erro" in criada) {
      toast.error(criada.erro);
      return;
    }
    const conclusao = await concluirIntimacao(intimacaoId, true);
    setTarefaAberta(false);
    if ("erro" in conclusao) {
      toast.error("A tarefa foi criada, mas não foi possível concluir a intimação.");
      router.refresh();
      return;
    }
    toast.success("Tarefa criada e intimação concluída.");
    router.push("/app/intimacoes");
  }

  if (concluida) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <p className="flex items-center gap-2 text-sm">
          <CheckCheck aria-hidden className="size-4 text-sucesso" />
          Intimação concluída. Ela não aparece mais como pendente.
        </p>
        <Button variant="outline" size="sm" disabled={ocupado} onClick={() => alterar(false)}>
          <Undo2 aria-hidden />
          Reabrir
        </Button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs">
      <div>
        <h2 className="text-lg font-semibold">Tratar esta intimação</h2>
        <p className="text-sm text-texto-secundario">
          Se não há prazo nem peça a fazer, conclua. Se há algo a providenciar, crie uma tarefa.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setTarefaAberta(true)} disabled={ocupado}>
          <ListPlus aria-hidden />
          Criar tarefa
        </Button>
        <Button variant="outline" onClick={() => alterar(true)} disabled={ocupado}>
          <CheckCheck aria-hidden />
          Concluir intimação
        </Button>
      </div>
      <ModalPrazoManual
        aberto={tarefaAberta}
        titulo="Nova tarefa"
        tipoInicial="compromisso"
        descricaoInicial={`Providenciar: ${partes}`.slice(0, 120)}
        processoInicial={processoId ?? undefined}
        processos={processos}
        aoFechar={() => setTarefaAberta(false)}
        aoSalvar={criarTarefa}
      />
    </section>
  );
}
