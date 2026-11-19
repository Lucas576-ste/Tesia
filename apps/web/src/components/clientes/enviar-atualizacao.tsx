"use client";

import { tituloNome } from "@tesia/shared";
import { Copy, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registrarContato } from "@/app/app/clientes/acoes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { copiarTexto } from "@/lib/copiar";
import { linkWhatsapp } from "@/lib/resumo-cliente";

type EnviarAtualizacaoProps = {
  clienteId: string;
  nome: string;
  telefone: string | null;
  movimentacao: { cnj: string; data: string; resumo: string } | null;
  proximoPrazo: string | null;
};

function montarMensagem({ nome, movimentacao, proximoPrazo }: EnviarAtualizacaoProps) {
  const primeiro = tituloNome(nome).split(" ")[0];
  if (!movimentacao)
    return `Olá, ${primeiro}! Passando para avisar que acompanho o seu processo e, por enquanto, não houve novidade. Assim que houver qualquer movimentação, eu te aviso.`;
  return [
    `Olá, ${primeiro}! Tenho uma atualização do seu processo nº ${movimentacao.cnj}.`,
    `Em ${movimentacao.data}: ${movimentacao.resumo}`,
    proximoPrazo
      ? `Já estou cuidando do próximo passo, que tem prazo até ${proximoPrazo}.`
      : "Sigo acompanhando e te aviso do próximo passo.",
    "Qualquer dúvida, é só me chamar.",
  ].join("\n\n");
}

export function EnviarAtualizacao(props: EnviarAtualizacaoProps) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState(() => montarMensagem(props));

  async function marcarContato() {
    await registrarContato(props.clienteId);
    router.refresh();
  }

  async function copiar() {
    await copiarTexto(texto, "Mensagem copiada.");
    await marcarContato();
  }

  return (
    <>
      <Button size="sm" onClick={() => setAberto(true)}>
        <Send aria-hidden />
        Enviar atualização
      </Button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Atualização para {tituloNome(props.nome)}</DialogTitle>
            <DialogDescription>
              Feita a partir da última intimação, em linguagem simples. Revise antes de enviar.
            </DialogDescription>
          </DialogHeader>
          <textarea
            aria-label="Mensagem para o cliente"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            rows={10}
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <DialogFooter className="gap-2">
            {props.telefone && (
              <Button asChild variant="outline">
                <a
                  href={linkWhatsapp(props.telefone, texto)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={marcarContato}
                >
                  <MessageCircle aria-hidden />
                  Abrir no WhatsApp
                </a>
              </Button>
            )}
            <Button onClick={copiar}>
              <Copy aria-hidden />
              Copiar mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
