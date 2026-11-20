"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AvatarLia } from "@/components/lia/avatar-lia";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TextoMarkdown } from "./texto-markdown";
import type { MensagemChat } from "./usar-chat-lia";

type MensagemLiaProps = {
  mensagem: MensagemChat;
  aoNavegar: () => void;
  aoAvaliar: (
    mensagemId: string,
    avaliacao: "positiva" | "negativa",
    comentario?: string,
  ) => Promise<boolean>;
};

function Avaliacao({
  mensagemId,
  atual,
  aoAvaliar,
}: {
  mensagemId: string;
  atual: "positiva" | "negativa" | null;
  aoAvaliar: MensagemLiaProps["aoAvaliar"];
}) {
  const [comentando, setComentando] = useState(false);
  const [comentario, setComentario] = useState("");
  const [agradecido, setAgradecido] = useState(false);

  async function positiva() {
    if (await aoAvaliar(mensagemId, "positiva")) setAgradecido(true);
  }

  async function negativa() {
    if (await aoAvaliar(mensagemId, "negativa", comentario.trim() || undefined)) {
      setComentando(false);
      setAgradecido(true);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Resposta útil"
          aria-pressed={atual === "positiva"}
          onClick={() => void positiva()}
          className={cn(atual === "positiva" && "bg-sucesso-fundo text-sucesso")}
        >
          <ThumbsUp aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Resposta não ajudou"
          aria-pressed={atual === "negativa"}
          onClick={() => setComentando(true)}
          className={cn(atual === "negativa" && "bg-erro-fundo text-erro")}
        >
          <ThumbsDown aria-hidden />
        </Button>
        {agradecido && (
          <span className="text-xs text-texto-secundario">Obrigada pelo retorno.</span>
        )}
      </div>
      {comentando && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`faltou-${mensagemId}`} className="text-xs font-medium">
            O que faltou? <span className="font-normal text-texto-secundario">(opcional)</span>
          </label>
          <textarea
            id={`faltou-${mensagemId}`}
            value={comentario}
            onChange={(evento) => setComentario(evento.target.value)}
            maxLength={500}
            rows={2}
            className="w-full resize-none rounded-md border bg-background p-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setComentando(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => void negativa()}>
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MensagemLia({ mensagem, aoNavegar, aoAvaliar }: MensagemLiaProps) {
  if (mensagem.papel === "usuario") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-(image:--dourado) px-3 py-2 text-[15px] leading-relaxed whitespace-pre-wrap text-menu">
          {mensagem.conteudo}
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <AvatarLia className="mt-1" />
      <div className="flex min-w-0 max-w-[88%] flex-col gap-2">
        <div className="rounded-2xl rounded-tl-sm bg-primaria-fundo px-3 py-2">
          <TextoMarkdown texto={mensagem.conteudo} aoNavegar={aoNavegar} />
        </div>
        {mensagem.acoes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mensagem.acoes.map((acao) => (
              <Button key={acao.id} asChild variant="outline" size="sm">
                <Link href={acao.href} onClick={aoNavegar}>
                  {acao.rotulo}
                </Link>
              </Button>
            ))}
          </div>
        )}
        {mensagem.mensagemId && (
          <Avaliacao
            mensagemId={mensagem.mensagemId}
            atual={mensagem.avaliacao}
            aoAvaliar={aoAvaliar}
          />
        )}
      </div>
    </div>
  );
}
