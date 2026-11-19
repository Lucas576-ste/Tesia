"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UsoMes } from "@/components/layout/uso-mes";
import { usePlano } from "@/components/plano/provedor-plano";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ExemploPlano } from "@/lib/conta-exemplo";
import { isoParaData } from "@/lib/prazo-interno";
import { ModalCancelar } from "./modal-cancelar";
import { ModalEscolhaPlano } from "./modal-escolha-plano";
import { ModalLimite } from "./modal-limite";

type Modal = ExemploPlano | "mudar" | "cancelar" | null;

type TelaPlanoProps = {
  exemploInicial: ExemploPlano | null;
};

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-texto-secundario">{rotulo}</dt>
      <dd className="text-sm tabular-nums">{valor}</dd>
    </div>
  );
}

export function TelaPlano({ exemploInicial }: TelaPlanoProps) {
  const { id, plano, uso, teste, fimPeriodo } = usePlano();
  const [modal, setModal] = useState<Modal>(exemploInicial);
  const { nome, preco } = plano;
  const fim = fimPeriodo ? isoParaData(fimPeriodo) : "—";

  function fechar(aberto: boolean) {
    if (!aberto) setModal(null);
  }

  function comprarPacote() {
    setModal(null);
    toast.info("A cobrança ainda não está ligada. Nenhum valor foi cobrado.");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-serif text-xl font-semibold">{nome}</h2>
          {!teste && <span className="text-sm text-texto-secundario tabular-nums">{preco}</span>}
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Dado rotulo={teste ? "Teste grátis até" : "Período atual até"} valor={fim} />
          <Dado rotulo="Forma de pagamento" valor={teste ? "Sem cartão no teste" : "A definir"} />
        </dl>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">Uso do mês</h3>
          <UsoMes {...uso} className="w-full max-w-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setModal("mudar")}>Mudar de plano</Button>
          <Button variant="outline" onClick={comprarPacote}>
            Comprar 10 peças por {plano.pacote}
          </Button>
          <Button variant="outline" disabled>
            Assinar o Plus (em breve)
          </Button>
        </div>
      </Card>
      <Card className="flex flex-col gap-2 p-4">
        <h2 className="text-base font-semibold">Faturas</h2>
        <p className="text-sm text-texto-secundario">
          Nenhuma fatura ainda. A cobrança será ligada antes do lançamento.
        </p>
      </Card>
      <Button variant="ghost" className="self-start text-erro" onClick={() => setModal("cancelar")}>
        Cancelar assinatura
      </Button>
      <ModalLimite
        aberto={modal === "limite-80" || modal === "limite-100"}
        bloqueio={modal === "limite-100"}
        limite={uso.limite}
        pacote={plano.pacote}
        aoMudar={fechar}
        aoComprar={comprarPacote}
        aoMudarPlano={() => setModal("mudar")}
      />
      <ModalEscolhaPlano
        aberto={modal === "fim-teste" || modal === "mudar"}
        fimDoTeste={modal === "fim-teste"}
        planoAtual={id}
        aoMudar={fechar}
      />
      <ModalCancelar aberto={modal === "cancelar"} fundador={id === "fundador"} aoMudar={fechar} />
    </div>
  );
}
