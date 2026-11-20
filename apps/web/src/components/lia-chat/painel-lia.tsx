"use client";

import { History, Maximize2, Minimize2, SquarePen, X, Headset, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AvatarLia } from "@/components/lia/avatar-lia";
import { Button } from "@/components/ui/button";
import { AVISO_RESTANTES } from "@/lib/lia/limites";
import { ABERTURA, sugestoesDaRota } from "@/lib/lia/sugestoes";
import { cn } from "@/lib/utils";
import { CampoMensagem } from "./campo-mensagem";
import { HistoricoLia } from "./historico-lia";
import { MensagemLia } from "./mensagem-lia";
import { SugestoesLia } from "./sugestoes-lia";
import { useChatLia } from "./usar-chat-lia";

const PERGUNTA_VENCENDO = "O que vence esta semana?";

type PainelLiaProps = {
  aberto: boolean;
  rota: string;
  vencendo: number;
  retencaoDias: number;
  aoFechar: () => void;
  painelRef: RefObject<HTMLDivElement | null>;
};

function linkSuporte() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "");
  if (whatsapp) return `https://wa.me/${whatsapp}`;
  const email = process.env.NEXT_PUBLIC_CONTATO_EMAIL;
  return email ? `mailto:${email}` : null;
}

export function PainelLia({
  aberto,
  rota,
  vencendo,
  retencaoDias,
  aoFechar,
  painelRef,
}: PainelLiaProps) {
  const chat = useChatLia(rota, aberto);
  const [expandido, setExpandido] = useState(false);
  const [vendoHistorico, setVendoHistorico] = useState(false);
  const campo = useRef<HTMLTextAreaElement>(null);
  const rolagem = useRef<HTMLDivElement>(null);
  const suporte = linkSuporte();

  useEffect(() => {
    if (aberto && !vendoHistorico) campo.current?.focus();
  }, [aberto, vendoHistorico]);

  useEffect(() => {
    const area = rolagem.current;
    if (area) area.scrollTop = area.scrollHeight;
  }, [chat.mensagens, chat.enviando, chat.erro]);

  const sugestoes = sugestoesDaRota(rota);
  const lista =
    vencendo > 0 && !sugestoes.includes(PERGUNTA_VENCENDO)
      ? [PERGUNTA_VENCENDO, ...sugestoes]
      : sugestoes;
  const restantes = chat.uso ? Math.max(chat.uso.limite - chat.uso.usadas, 0) : null;
  const vazio = chat.mensagens.length === 0;

  function enviarPergunta(pergunta: string) {
    setVendoHistorico(false);
    void chat.enviar(pergunta);
  }

  return (
    <div
      ref={painelRef}
      role="dialog"
      aria-modal="false"
      aria-label="Chat com a Lia"
      hidden={!aberto}
      onKeyDown={(evento) => {
        if (evento.key === "Escape") aoFechar();
      }}
      className={cn(
        "fixed z-50 flex flex-col overflow-hidden border bg-background shadow-xl",
        "max-md:inset-0 max-md:pt-[env(safe-area-inset-top)]",
        "md:right-4 md:bottom-24 md:max-h-[70vh] md:rounded-2xl",
        expandido
          ? "md:h-[70vh] md:w-[min(720px,calc(100vw-2rem))]"
          : "md:h-[min(640px,70vh)] md:w-[380px]",
      )}
    >
      <header className="flex flex-col gap-1 border-b bg-card px-3 py-2.5">
        <div className="flex items-center gap-2">
          {vendoHistorico ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Voltar para a conversa"
              onClick={() => setVendoHistorico(false)}
            >
              <ArrowLeft aria-hidden />
            </Button>
          ) : (
            <AvatarLia className="size-9 text-base" />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-sm leading-tight font-semibold text-titulo">
              {vendoHistorico ? "Conversas anteriores" : "Lia"}
            </h2>
            <p className="text-xs text-texto-secundario">Assistente da Tesia</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Nova conversa"
            title="Nova conversa"
            onClick={() => {
              chat.novaConversa();
              setVendoHistorico(false);
            }}
          >
            <SquarePen aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Conversas anteriores"
            title="Conversas anteriores"
            aria-pressed={vendoHistorico}
            onClick={() => setVendoHistorico((atual) => !atual)}
          >
            <History aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={expandido ? "Reduzir painel" : "Expandir painel"}
            title={expandido ? "Reduzir" : "Expandir"}
            onClick={() => setExpandido((atual) => !atual)}
            className="max-md:hidden"
          >
            {expandido ? <Minimize2 aria-hidden /> : <Maximize2 aria-hidden />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Fechar"
            title="Fechar"
            onClick={aoFechar}
          >
            <X aria-hidden />
          </Button>
        </div>
        {suporte && (
          <a
            href={suporte}
            target="_blank"
            rel="noreferrer"
            className="flex w-fit items-center gap-1 text-xs font-medium text-primaria underline underline-offset-2"
          >
            <Headset aria-hidden className="size-3.5" />
            Falar com uma pessoa
          </a>
        )}
      </header>
      <p className="border-b bg-primaria-fundo px-3 py-1.5 text-xs text-texto">
        A Lia ajuda a pensar. A decisão e a assinatura são suas.
      </p>
      <div ref={rolagem} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        {vendoHistorico ? (
          <HistoricoLia
            aoAbrir={(id) => {
              setVendoHistorico(false);
              void chat.abrirDoHistorico(id);
            }}
          />
        ) : (
          <div role="log" aria-live="polite" aria-label="Mensagens" className="flex flex-col gap-3">
            {vazio && (
              <>
                <div className="flex items-start gap-2">
                  <AvatarLia className="mt-1" />
                  <p className="rounded-2xl rounded-tl-sm bg-primaria-fundo px-3 py-2 text-[15px] leading-relaxed">
                    {ABERTURA}
                  </p>
                </div>
                <SugestoesLia sugestoes={lista} aoEscolher={enviarPergunta} />
              </>
            )}
            {chat.mensagens.map((mensagem) => (
              <MensagemLia
                key={mensagem.chave}
                mensagem={mensagem}
                aoNavegar={() => matchMedia("(max-width: 767px)").matches && aoFechar()}
                aoAvaliar={chat.avaliar}
              />
            ))}
            {chat.enviando && !chat.recebendo && (
              <p className="flex items-center gap-2 text-sm text-texto-secundario">
                <span
                  aria-hidden
                  className="size-2 rounded-full bg-destaque motion-safe:animate-pulse"
                />
                A Lia está escrevendo…
              </p>
            )}
            {chat.erro && (
              <div
                role="alert"
                className="flex flex-col items-start gap-2 rounded-xl bg-erro-fundo p-3 text-sm text-erro"
              >
                {chat.erro}
                <Button variant="outline" size="sm" onClick={chat.tentarNovamente}>
                  Tentar novamente
                </Button>
              </div>
            )}
            {chat.limiteAtingido && (
              <p role="status" className="rounded-xl bg-atencao-fundo p-3 text-sm text-atencao">
                {chat.limiteAtingido}
              </p>
            )}
          </div>
        )}
      </div>
      <footer className="flex flex-col gap-2 border-t bg-card p-3 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <CampoMensagem
          ref={campo}
          enviando={chat.enviando}
          desabilitado={Boolean(chat.limiteAtingido)}
          aoEnviar={enviarPergunta}
          aoInterromper={chat.interromper}
        />
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-texto-secundario">
          {chat.uso && (
            <span className="tabular-nums">
              Perguntas hoje: {chat.uso.usadas} de {chat.uso.limite}
            </span>
          )}
          {restantes !== null && restantes > 0 && restantes <= AVISO_RESTANTES && (
            <span role="status" className="font-medium text-atencao">
              Restam {restantes} {restantes === 1 ? "pergunta" : "perguntas"} hoje
            </span>
          )}
        </div>
        <details className="text-xs text-texto-secundario">
          <summary className="w-fit cursor-pointer font-medium text-primaria underline underline-offset-2">
            Como a Lia usa seus dados
          </summary>
          <p className="mt-1">
            Para responder, enviamos ao provedor de IA a sua pergunta, a tela em que você está e
            dados da sua conta ligados a ela, como prazos e o processo aberto. As conversas ficam
            salvas só para você, por {retencaoDias} dias, e você pode apagá-las em &quot;Conversas
            anteriores&quot;.
          </p>
        </details>
      </footer>
    </div>
  );
}
