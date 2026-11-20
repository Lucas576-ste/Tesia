"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  abrirConversa,
  avaliarResposta,
  consultarUsoLia,
  type MensagemSalva,
} from "@/app/app/lia-acoes";
import type { AcaoLia } from "@/lib/lia/acoes";
import { ocultarMarcadores } from "@/lib/lia/acoes";
import { enviarPergunta } from "./cliente-lia";

export type MensagemChat = {
  chave: string;
  mensagemId: string | null;
  papel: "usuario" | "lia";
  conteudo: string;
  acoes: AcaoLia[];
  avaliacao: "positiva" | "negativa" | null;
};

export type UsoLia = { usadas: number; limite: number };

let contador = 0;
function novaChave() {
  contador += 1;
  return `m${contador}`;
}

function deSalva(mensagem: MensagemSalva): MensagemChat {
  return {
    chave: novaChave(),
    mensagemId: mensagem.id,
    papel: mensagem.papel,
    conteudo: mensagem.conteudo,
    acoes: [],
    avaliacao: mensagem.avaliacao,
  };
}

export function useChatLia(rota: string, ativo: boolean) {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [conversaId, setConversaId] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);
  const [recebendo, setRecebendo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [limiteAtingido, setLimiteAtingido] = useState<string | null>(null);
  const [uso, setUso] = useState<UsoLia | null>(null);
  const controle = useRef<AbortController | null>(null);
  const ultimaPergunta = useRef("");

  useEffect(() => {
    if (!ativo || uso) return;
    let atual = true;
    consultarUsoLia().then((valor) => {
      if (!atual) return;
      setUso(valor);
      if (valor.limite > 0 && valor.usadas >= valor.limite) {
        setLimiteAtingido(
          `Você chegou ao limite de ${valor.limite} perguntas de hoje. Elas voltam amanhã.`,
        );
      }
    });
    return () => {
      atual = false;
    };
  }, [ativo, uso]);

  const enviar = useCallback(
    async (texto: string, reenvio = false) => {
      const mensagem = texto.trim();
      if (!mensagem || enviando) return;
      ultimaPergunta.current = mensagem;
      setErro(null);
      setEnviando(true);
      setRecebendo(false);
      const chaveResposta = novaChave();
      if (!reenvio) {
        setMensagens((atuais) => [
          ...atuais,
          {
            chave: novaChave(),
            mensagemId: null,
            papel: "usuario",
            conteudo: mensagem,
            acoes: [],
            avaliacao: null,
          },
        ]);
      }
      const abortador = new AbortController();
      controle.current = abortador;
      let criada = false;

      const resultado = await enviarPergunta({
        pedido: { conversaId, mensagem, rota, reenvio },
        signal: abortador.signal,
        aoEvento: (evento) => {
          if (evento.tipo === "inicio") setConversaId(evento.conversaId);
          if (evento.tipo === "texto") {
            setRecebendo(true);
            setMensagens((atuais) => {
              if (!criada) {
                criada = true;
                return [
                  ...atuais,
                  {
                    chave: chaveResposta,
                    mensagemId: null,
                    papel: "lia",
                    conteudo: evento.valor,
                    acoes: [],
                    avaliacao: null,
                  },
                ];
              }
              return atuais.map((item) =>
                item.chave === chaveResposta
                  ? { ...item, conteudo: item.conteudo + evento.valor }
                  : item,
              );
            });
          }
          if (evento.tipo === "fim") {
            setUso(evento.uso);
            setMensagens((atuais) =>
              atuais.map((item) =>
                item.chave === chaveResposta
                  ? {
                      ...item,
                      conteudo: ocultarMarcadores(item.conteudo),
                      mensagemId: evento.mensagemId,
                      acoes: evento.acoes,
                    }
                  : item,
              ),
            );
          }
        },
      });

      if (resultado.tipo === "limite") {
        setLimiteAtingido(resultado.mensagem);
        if (resultado.uso) setUso(resultado.uso);
        if (!reenvio) setMensagens((atuais) => atuais.slice(0, -1));
      } else if (resultado.tipo === "erro") {
        setErro(resultado.mensagem);
      }
      setEnviando(false);
      setRecebendo(false);
      controle.current = null;
    },
    [conversaId, enviando, rota],
  );

  const interromper = useCallback(() => controle.current?.abort(), []);

  const tentarNovamente = useCallback(() => {
    void enviar(ultimaPergunta.current, true);
  }, [enviar]);

  const novaConversa = useCallback(() => {
    controle.current?.abort();
    setMensagens([]);
    setConversaId(undefined);
    setErro(null);
  }, []);

  const abrirDoHistorico = useCallback(async (id: string) => {
    controle.current?.abort();
    setErro(null);
    setConversaId(id);
    setMensagens((await abrirConversa(id)).map(deSalva));
  }, []);

  const avaliar = useCallback(
    async (mensagemId: string, avaliacao: "positiva" | "negativa", comentario?: string) => {
      const resultado = await avaliarResposta({ mensagemId, avaliacao, comentario });
      if ("erro" in resultado) return false;
      setMensagens((atuais) =>
        atuais.map((item) => (item.mensagemId === mensagemId ? { ...item, avaliacao } : item)),
      );
      return true;
    },
    [],
  );

  return {
    mensagens,
    conversaId,
    enviando,
    recebendo,
    erro,
    limiteAtingido,
    uso,
    enviar,
    interromper,
    tentarNovamente,
    novaConversa,
    abrirDoHistorico,
    avaliar,
  };
}
