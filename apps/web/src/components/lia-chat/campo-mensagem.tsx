"use client";

import { SendHorizontal, Square } from "lucide-react";
import { forwardRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { MAXIMO_CARACTERES } from "@/lib/lia/limites";

type CampoMensagemProps = {
  enviando: boolean;
  desabilitado: boolean;
  aoEnviar: (texto: string) => void;
  aoInterromper: () => void;
};

export const CampoMensagem = forwardRef<HTMLTextAreaElement, CampoMensagemProps>(
  function CampoMensagem({ enviando, desabilitado, aoEnviar, aoInterromper }, ref) {
    const [texto, setTexto] = useState("");

    function enviar() {
      if (!texto.trim() || enviando || desabilitado) return;
      aoEnviar(texto);
      setTexto("");
    }

    function aoTeclar(evento: KeyboardEvent<HTMLTextAreaElement>) {
      if (evento.key === "Enter" && !evento.shiftKey) {
        evento.preventDefault();
        enviar();
      }
    }

    return (
      <div className="flex items-end gap-2">
        <label htmlFor="mensagem-lia" className="sr-only">
          Pergunte à Lia
        </label>
        <textarea
          id="mensagem-lia"
          ref={ref}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={aoTeclar}
          maxLength={MAXIMO_CARACTERES}
          rows={1}
          disabled={desabilitado}
          placeholder={desabilitado ? "Limite de hoje atingido" : "Pergunte à Lia…"}
          className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border bg-card px-3 py-2 text-[15px] outline-none placeholder:text-texto-secundario focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60 [field-sizing:content]"
        />
        {enviando ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={aoInterromper}
            aria-label="Interromper resposta"
          >
            <Square aria-hidden className="fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            onClick={enviar}
            disabled={desabilitado || !texto.trim()}
            aria-label="Enviar"
          >
            <SendHorizontal aria-hidden />
          </Button>
        )}
      </div>
    );
  },
);
