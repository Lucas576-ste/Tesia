"use client";

import { CheckCheck, EyeOff, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { encaminharIntimacoes, tratarIntimacoes } from "@/app/app/intimacoes/tratamento-acoes";
import { Button } from "@/components/ui/button";
import { SelectNativo } from "@/components/ui/select-nativo";
import { resumoDoLote } from "@/lib/tratamento-intimacao";
import type { Responsavel } from "@/lib/termos";

type BarraLoteProps = {
  ids: string[];
  responsaveis: Responsavel[];
  aoLimpar: () => void;
};

export function BarraLote({ ids, responsaveis, aoLimpar }: BarraLoteProps) {
  const router = useRouter();
  const [ocupado, iniciar] = useTransition();
  const [destino, setDestino] = useState("");

  function concluirOuIgnorar(acao: "concluir" | "ignorar") {
    iniciar(async () => {
      const resultado = await tratarIntimacoes(ids, acao);
      if ("erro" in resultado) return void toast.error(resultado.erro);
      const verbo = acao === "concluir" ? "concluída" : "ignorada";
      const texto = resumoDoLote(
        resultado.feitas,
        resultado.puladas,
        resultado.feitas === 1 ? verbo : `${verbo}s`,
      );
      if (resultado.feitas === 0) toast.error(texto);
      else toast.success(texto);
      aoLimpar();
      router.refresh();
    });
  }

  function encaminhar() {
    if (!destino) return;
    iniciar(async () => {
      const resultado = await encaminharIntimacoes(ids, destino);
      if ("erro" in resultado) return void toast.error(resultado.erro);
      const texto = resumoDoLote(
        resultado.feitas,
        resultado.puladas,
        resultado.feitas === 1 ? "encaminhada" : "encaminhadas",
      );
      if (resultado.feitas === 0) toast.error(texto);
      else toast.success(texto);
      setDestino("");
      aoLimpar();
      router.refresh();
    });
  }

  return (
    <div
      role="region"
      aria-label="Ações em lote"
      className="sticky bottom-20 z-20 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 shadow-lg md:bottom-4"
    >
      <span className="text-sm font-medium">
        {ids.length === 1 ? "1 selecionada" : `${ids.length} selecionadas`}
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={ocupado}
        onClick={() => concluirOuIgnorar("concluir")}
      >
        <CheckCheck aria-hidden />
        Concluir
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={ocupado}
        onClick={() => concluirOuIgnorar("ignorar")}
      >
        <EyeOff aria-hidden />
        Ignorar
      </Button>
      {responsaveis.length > 1 && (
        <span className="flex items-center gap-1">
          <SelectNativo
            aria-label="Encaminhar para"
            className="h-8 w-44"
            value={destino}
            onChange={(evento) => setDestino(evento.target.value)}
          >
            <option value="">Encaminhar para...</option>
            {responsaveis.map(({ id, nome }) => (
              <option key={id} value={id}>
                {nome}
              </option>
            ))}
          </SelectNativo>
          <Button size="sm" variant="outline" disabled={ocupado || !destino} onClick={encaminhar}>
            <Send aria-hidden />
            Encaminhar
          </Button>
        </span>
      )}
      <Button size="sm" variant="ghost" className="ml-auto" onClick={aoLimpar}>
        <X aria-hidden />
        Limpar seleção
      </Button>
    </div>
  );
}
