"use client";

import type { PapelUsuario } from "@tesia/shared";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { dividirDocumento } from "@/lib/formatar-publicacao";
import type { ProcessoResumo } from "@/lib/prazo-manual";
import type { Responsavel } from "@/lib/termos";
import type { DadosTratamento } from "@/lib/tratamento-dados";
import { PainelTratamento } from "./painel-tratamento";
import { TextoDaPublicacao } from "./texto-da-publicacao";

const INTERVALO_MS = 4000;

type TelaTratamentoProps = {
  dados: DadosTratamento;
  processos: ProcessoResumo[];
  responsaveis: Responsavel[];
  usuario: { id: string; papel: PapelUsuario };
};

function AvisoDeAnalise({ status }: { status: DadosTratamento["status"] }) {
  if (status === "erro") {
    return (
      <p role="alert" className="rounded-md bg-erro-fundo px-3 py-2 text-sm">
        Não consegui analisar esta intimação. Você ainda pode ler o texto e tratá-la aqui.
      </p>
    );
  }
  return (
    <p role="status" className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
      <LoaderCircle aria-hidden className="size-4 animate-spin text-primaria" />
      {status === "processando" ? "A Lia está lendo a intimação." : "Na fila para análise."} Esta
      página atualiza sozinha.
    </p>
  );
}

export function TelaTratamento({ dados, processos, responsaveis, usuario }: TelaTratamentoProps) {
  const router = useRouter();
  const analisando = dados.status === "recebida" || dados.status === "processando";

  useEffect(() => {
    if (!analisando) return;
    const intervalo = setInterval(() => router.refresh(), INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [analisando, router]);

  return (
    <div className="flex w-full flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/app/intimacoes">
          <ArrowLeft aria-hidden />
          Voltar às intimações
        </Link>
      </Button>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-titulo md:text-3xl">
          {(dados.processo?.partes ?? dados.sugestaoProcesso.partes) || "Intimação recebida"}
        </h1>
        <p className="text-sm text-texto-secundario">
          {[dados.sugestaoProcesso.cnj, dados.tribunal, dados.tipoPublicacao, dados.publicadaEm]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>
      <AvisoDeAnalise status={dados.status} />
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <PainelTratamento
          dados={dados}
          processos={processos}
          responsaveis={responsaveis}
          usuario={usuario}
        />
        <TextoDaPublicacao
          blocos={dividirDocumento(dados.texto)}
          textoOriginal={dados.texto}
          vazio="O texto do documento ainda não está disponível."
        />
      </div>
    </div>
  );
}
