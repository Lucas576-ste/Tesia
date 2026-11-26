"use client";

import { Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { criarProcesso } from "@/app/app/processos/acoes";
import {
  buscarProcessosParaVincular,
  vincularProcesso,
  type ProcessoBusca,
} from "@/app/app/intimacoes/tratamento-acoes";
import { FormularioProcesso } from "@/components/processo/formulario-processo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { DadosProcesso } from "@/lib/processo-tipos";

type DialogoBase = {
  aberto: boolean;
  intimacaoId: string;
  aoFechar: () => void;
  aoVincular: () => void;
};

export function DialogoVincularProcesso({
  aberto,
  intimacaoId,
  aoFechar,
  aoVincular,
}: DialogoBase) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<ProcessoBusca[]>([]);
  const [buscou, setBuscou] = useState(false);
  const [ocupado, iniciar] = useTransition();

  useEffect(() => {
    if (busca.trim().length < 3) return;
    const espera = setTimeout(async () => {
      setResultados(await buscarProcessosParaVincular(busca));
      setBuscou(true);
    }, 350);
    return () => clearTimeout(espera);
  }, [busca]);

  function escolher(processo: ProcessoBusca) {
    iniciar(async () => {
      const resultado = await vincularProcesso(intimacaoId, processo.id);
      if ("erro" in resultado) return void toast.error(resultado.erro);
      toast.success("Processo vinculado.");
      aoVincular();
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={(valor) => !valor && aoFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular a um processo</DialogTitle>
          <DialogDescription>
            Busque pelo número do processo ou pelo nome das partes.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search aria-hidden className="absolute top-2.5 left-2.5 size-4 text-texto-secundario" />
          <Input
            autoFocus
            aria-label="Buscar processo"
            className="pl-8"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
        <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {resultados.map((processo) => (
            <li key={processo.id}>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => escolher(processo)}
                className="flex w-full flex-col rounded-md border p-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{processo.partes}</span>
                <span className="text-xs text-texto-secundario tabular-nums">{processo.cnj}</span>
              </button>
            </li>
          ))}
          {buscou && busca.trim().length >= 3 && resultados.length === 0 && (
            <li className="text-sm text-texto-secundario">Nenhum processo encontrado.</li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export function DialogoNovoProcesso({
  aberto,
  intimacaoId,
  sugestao,
  aoFechar,
  aoVincular,
}: DialogoBase & { sugestao: DadosProcesso }) {
  async function salvar(dados: DadosProcesso) {
    const criado = await criarProcesso(dados);
    if ("erro" in criado) return void toast.error(criado.erro);
    const vinculo = await vincularProcesso(intimacaoId, criado.id);
    if ("erro" in vinculo) {
      toast.error(`O processo foi criado, mas não foi possível vinculá-lo. ${vinculo.erro}`);
      return aoFechar();
    }
    toast.success("Processo cadastrado e vinculado.");
    aoVincular();
  }

  return (
    <Dialog open={aberto} onOpenChange={(valor) => !valor && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar novo processo</DialogTitle>
          <DialogDescription>
            Já vem preenchido com o que a Tesia encontrou. Confira antes de salvar.
          </DialogDescription>
        </DialogHeader>
        <FormularioProcesso dados={sugestao} aoSalvar={salvar} />
      </DialogContent>
    </Dialog>
  );
}
