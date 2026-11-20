"use client";

import {
  mascararEmail,
  mascararNome,
  mascararOab,
  mascararTelefone,
  formatarTelefone,
} from "@tesia/shared";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { pedirDados } from "@/app/app/configuracoes/dados-acoes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { PerfilConta, ResumoDados } from "@/lib/perfil-conta";
import { CampoLeitura } from "./campo-leitura";
import { ValorMascarado } from "./valor-mascarado";

const PALAVRA_CONFIRMACAO = "EXCLUIR";

function contagem(valor: number, singular: string, plural: string) {
  return `${valor} ${valor === 1 ? singular : plural}`;
}

export function AbaDados({ conta, resumo }: { conta: PerfilConta; resumo: ResumoDados }) {
  const [excluindo, setExcluindo] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [enviando, iniciar] = useTransition();
  const oab = conta.oab ? `${conta.oab}/${conta.uf ?? ""}` : "";
  const whatsapp = formatarTelefone(conta.whatsapp);

  function pedir(tipo: "exportacao" | "exclusao") {
    iniciar(async () => {
      const resultado = await pedirDados(tipo);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      setExcluindo(false);
      setConfirmacao("");
      toast.success(
        tipo === "exportacao"
          ? "Pedido registrado. Enviamos seus dados por e-mail em até 15 dias."
          : "Pedido registrado. Confirmamos por e-mail antes de apagar qualquer coisa.",
      );
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-titulo">Seus dados</h2>
          <p className="text-sm text-texto-secundario">
            Dados pessoais ficam escondidos. Toque no olho para ver; eles se escondem de novo em 30
            segundos.
          </p>
        </div>
        <dl className="flex flex-col gap-3">
          <CampoLeitura rotulo="Nome">
            <ValorMascarado rotulo="nome" real={conta.nome} mascarado={mascararNome(conta.nome)} />
          </CampoLeitura>
          <CampoLeitura rotulo="E-mail">
            <ValorMascarado
              rotulo="e-mail"
              real={conta.email}
              mascarado={mascararEmail(conta.email)}
            />
          </CampoLeitura>
          <CampoLeitura rotulo="OAB">
            <ValorMascarado rotulo="OAB" real={oab} mascarado={mascararOab(conta.oab, conta.uf)} />
          </CampoLeitura>
          <CampoLeitura rotulo="WhatsApp">
            <ValorMascarado
              rotulo="WhatsApp"
              real={whatsapp}
              mascarado={mascararTelefone(conta.whatsapp)}
            />
          </CampoLeitura>
        </dl>
      </Card>
      <Card className="gap-3 p-5">
        <h2 className="text-base font-semibold text-titulo">O que a Tesia guarda</h2>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <li>{contagem(resumo.processos, "processo", "processos")}</li>
          <li>{contagem(resumo.prazos, "prazo", "prazos")}</li>
          <li>{contagem(resumo.pecas, "peça gerada", "peças geradas")}</li>
          <li>{contagem(resumo.pecasEstilo, "peça do seu estilo", "peças do seu estilo")}</li>
        </ul>
      </Card>
      <Card className="gap-5 p-5">
        <section className="flex flex-col items-start gap-2">
          <h2 className="text-base font-semibold text-titulo">Exportar tudo</h2>
          <p className="text-sm text-texto-secundario">
            Peça uma cópia das suas peças, prazos e processos. Enviamos por e-mail em até 15 dias.
          </p>
          <Button variant="outline" disabled={enviando} onClick={() => pedir("exportacao")}>
            Pedir exportação dos meus dados
          </Button>
        </section>
        <section className="flex flex-col items-start gap-2 border-t pt-5">
          <h2 className="text-base font-semibold text-titulo">Excluir conta</h2>
          <p className="text-sm text-texto-secundario">
            Peça a exportação antes. Confirmamos por e-mail, e depois de excluir não é possível
            recuperar. Nada é apagado até a confirmação.
          </p>
          <Button variant="destructive" onClick={() => setExcluindo(true)}>
            Pedir exclusão da conta
          </Button>
        </section>
      </Card>
      <Dialog open={excluindo} onOpenChange={setExcluindo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pedir a exclusão da sua conta?</DialogTitle>
            <DialogDescription>
              Peças, prazos, processos e o seu estilo serão apagados depois da confirmação por
              e-mail. Não é possível desfazer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmar-exclusao" className="text-sm font-medium">
              Digite {PALAVRA_CONFIRMACAO} para continuar
            </label>
            <Input
              id="confirmar-exclusao"
              autoComplete="off"
              value={confirmacao}
              onChange={(evento) => setConfirmacao(evento.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={enviando || confirmacao.trim() !== PALAVRA_CONFIRMACAO}
              onClick={() => pedir("exclusao")}
            >
              Pedir exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
