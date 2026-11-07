"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UsoMes } from "@/components/layout/uso-mes";
import { usePlanoDemo } from "@/components/plano/provedor-plano-demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { faturasExemplo, planoAtualExemplo, type ExemploPlano } from "@/lib/conta-exemplo";
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
  const { id, plano, uso } = usePlanoDemo();
  const [modal, setModal] = useState<Modal>(exemploInicial);
  const { nome, preco } = plano;
  const { proximaCobranca, pagamento } = planoAtualExemplo;

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
          <span className="text-sm text-texto-secundario tabular-nums">{preco}</span>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Dado rotulo="Próxima cobrança" valor={proximaCobranca} />
          <Dado rotulo="Forma de pagamento" valor={pagamento} />
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
        <ul className="rounded-md border">
          {faturasExemplo.map(({ id, data, valor, status }) => (
            <li
              key={id}
              className="flex flex-wrap items-center gap-3 border-b p-2 text-sm last:border-b-0"
            >
              <span className="tabular-nums">{data}</span>
              <span className="tabular-nums">{valor}</span>
              <Badge variant="secondary">{status}</Badge>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => toast.info("Demonstração: nenhuma nota foi gerada.")}
              >
                Nota fiscal
              </Button>
            </li>
          ))}
        </ul>
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
