"use client";

import { FileText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { consultarStatus, registrarIntimacao } from "@/app/app/intimacoes/acoes";
import { Button } from "@/components/ui/button";
import { ZonaUpload } from "@/components/zona-upload";
import { BUCKET_INTIMACOES, caminhoIntimacao, motivoRecusa } from "@/lib/envio-intimacao";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import { ListaEnvios, type Envio } from "./lista-envios";

const INTERVALO_CONSULTA = 2000;
const MAXIMO_CONSULTAS = 150;

type Selecionado = { chave: string; arquivo: File };

export function EnvioIntimacao({ escritorioId }: { escritorioId: string }) {
  const [selecionados, setSelecionados] = useState<Selecionado[]>([]);
  const [recusas, setRecusas] = useState<string[]>([]);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [enviando, setEnviando] = useState(false);
  const consultas = useRef(0);

  const acompanhando = envios.some(
    ({ status, intimacaoId }) => intimacaoId && (status === "recebida" || status === "processando"),
  );

  useEffect(() => {
    if (!acompanhando) return;
    const temporizador = setInterval(async () => {
      consultas.current += 1;
      if (consultas.current > MAXIMO_CONSULTAS) return clearInterval(temporizador);
      const ids = envios.flatMap(({ intimacaoId }) => (intimacaoId ? [intimacaoId] : []));
      const atuais = await consultarStatus(ids);
      setEnvios((anteriores) =>
        anteriores.map((envio) => {
          const encontrado = atuais.find(({ id }) => id === envio.intimacaoId);
          return encontrado ? { ...envio, status: encontrado.status } : envio;
        }),
      );
    }, INTERVALO_CONSULTA);
    return () => clearInterval(temporizador);
  }, [acompanhando, envios]);

  function adicionar(novos: File[]) {
    const aceitos = novos.filter((arquivo) => !motivoRecusa(arquivo));
    setRecusas(
      novos.flatMap((arquivo) => {
        const motivo = motivoRecusa(arquivo);
        return motivo ? [`${arquivo.name}: ${motivo}`] : [];
      }),
    );
    setSelecionados((atuais) => [
      ...atuais,
      ...aceitos.map((arquivo) => ({ chave: crypto.randomUUID(), arquivo })),
    ]);
  }

  function atualizar(chave: string, mudanca: Partial<Envio>) {
    setEnvios((atuais) =>
      atuais.map((envio) => (envio.chave === chave ? { ...envio, ...mudanca } : envio)),
    );
  }

  async function enviarUm({ chave, arquivo }: Selecionado) {
    const caminho = caminhoIntimacao(escritorioId);
    const { error } = await criarClienteNavegador()
      .storage.from(BUCKET_INTIMACOES)
      .upload(caminho, arquivo, { contentType: "application/pdf", upsert: false });
    if (error) return atualizar(chave, { status: "erro", erro: "Falha no envio. Tente de novo." });

    const resultado = await registrarIntimacao(caminho);
    if ("erro" in resultado) return atualizar(chave, { status: "erro", erro: resultado.erro });
    atualizar(chave, { status: "recebida", intimacaoId: resultado.id });
  }

  async function enviar() {
    const fila = selecionados;
    setEnviando(true);
    setSelecionados([]);
    consultas.current = 0;
    setEnvios((atuais) => [
      ...fila.map(({ chave, arquivo }) => ({
        chave,
        nome: arquivo.name,
        status: "enviando" as const,
      })),
      ...atuais,
    ]);
    for (const item of fila) await enviarUm(item);
    setEnviando(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <ZonaUpload
        titulo="Arraste os PDFs ou clique para escolher"
        descricao="Uma ou várias intimações, até 20 MB cada"
        accept=".pdf,application/pdf"
        aoEscolher={adicionar}
      />
      {recusas.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 text-sm text-erro">
          {recusas.map((recusa) => (
            <li key={recusa}>{recusa}</li>
          ))}
        </ul>
      )}
      {selecionados.length > 0 && (
        <ul className="flex flex-col gap-2">
          {selecionados.map(({ chave, arquivo }) => (
            <li
              key={chave}
              className="flex items-center gap-2 rounded-md border bg-card p-2 text-sm"
            >
              <FileText aria-hidden className="size-4 shrink-0 text-erro" />
              <span className="min-w-0 flex-1 break-all">{arquivo.name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remover ${arquivo.name}`}
                onClick={() => setSelecionados((atuais) => atuais.filter((s) => s.chave !== chave))}
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button
        disabled={selecionados.length === 0 || enviando}
        onClick={enviar}
        className="w-full sm:w-auto sm:self-end"
      >
        Enviar para análise
      </Button>
      {envios.length > 0 && <ListaEnvios envios={envios} />}
    </div>
  );
}
