"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { salvarModelo, usarModeloPadrao } from "@/app/app/configuracoes/modelo-acoes";
import { BUCKET_MODELOS, caminhoModelo, motivoRecusaModelo, TIPO_DOCX } from "@/lib/modelo-docx";
import { criarClienteNavegador } from "@/lib/supabase/navegador";
import type { DadosModelo } from "./envio-modelo";
import { ModalRemoverTimbrado } from "./modal-remover-timbrado";
import { TimbradoAtivo } from "./timbrado-ativo";
import { TimbradoErro } from "./timbrado-erro";
import { TimbradoProcessando } from "./timbrado-processando";
import { TimbradoVazio } from "./timbrado-vazio";

export type DadosTimbrado = DadosModelo & {
  status: "processando" | "ativo" | "erro" | null;
  nome: string | null;
  enviadoEm: string | null;
  erro: string | null;
};

const LIMITE_PROCESSANDO_MS = 2 * 60 * 1000;
const ERRO_TEMPO = "A leitura demorou mais que o esperado. Envie o arquivo de novo.";

function statusEfetivo(dados: DadosTimbrado) {
  if (dados.status !== "processando") return { status: dados.status, erro: dados.erro };
  const enviado = dados.enviadoEm ? new Date(dados.enviadoEm).getTime() : 0;
  return Date.now() - enviado > LIMITE_PROCESSANDO_MS
    ? { status: "erro" as const, erro: ERRO_TEMPO }
    : { status: "processando" as const, erro: null };
}

function verPrevia() {
  document
    .getElementById("previa-timbrado")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PainelTimbrado({ dados }: { dados: DadosTimbrado }) {
  const [ocupado, iniciar] = useTransition();
  const [removendo, setRemovendo] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [nomeEnviando, setNomeEnviando] = useState<string | null>(null);
  const seletor = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { status, erro } = statusEfetivo(dados);

  function aoEscolher(arquivos: File[]) {
    const arquivo = arquivos[0];
    if (!arquivo) return;
    setErroLocal(null);
    const motivo = motivoRecusaModelo(arquivo);
    if (motivo) {
      if (status === "ativo") toast.error(motivo);
      else setErroLocal(motivo);
      return;
    }
    setNomeEnviando(arquivo.name);
    iniciar(async () => {
      const caminho = caminhoModelo(dados.escritorioId, dados.usuarioId);
      const { error } = await criarClienteNavegador()
        .storage.from(BUCKET_MODELOS)
        .upload(caminho, arquivo, { contentType: TIPO_DOCX });
      if (error) {
        const mensagem = "Falha no envio. Verifique sua conexão e tente de novo.";
        if (status === "ativo") toast.error(mensagem);
        else setErroLocal(mensagem);
        return;
      }
      const resultado = await salvarModelo(caminho, arquivo.name);
      if ("erro" in resultado) {
        if (status === "ativo") toast.error(resultado.erro);
        router.refresh();
        return;
      }
      toast.success("Timbrado salvo. Sua próxima peça já sai com ele.", {
        action: { label: "Ver prévia", onClick: verPrevia },
      });
      router.refresh();
    });
  }

  function abrirSeletor() {
    seletor.current?.click();
  }

  function remover() {
    setRemovendo(true);
    iniciar(async () => {
      const resultado = await usarModeloPadrao();
      setRemovendo(false);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      setConfirmando(false);
      toast.success("Timbrado removido.");
      router.refresh();
    });
  }

  const input = (
    <input
      ref={seletor}
      type="file"
      accept=".docx,.pdf"
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(evento) => {
        aoEscolher(Array.from(evento.target.files ?? []));
        evento.target.value = "";
      }}
    />
  );

  const conteudo = ocupado ? (
    <TimbradoProcessando nome={nomeEnviando} />
  ) : erroLocal || status === "erro" ? (
    <TimbradoErro
      mensagem={erroLocal ?? erro ?? "Não conseguimos ler este arquivo."}
      aoTentarOutro={abrirSeletor}
    />
  ) : status === "processando" ? (
    <TimbradoProcessando nome={dados.nome} />
  ) : status === "ativo" ? (
    <TimbradoAtivo
      nome={dados.nome ?? "Timbrado.docx"}
      enviadoEm={dados.enviadoEm}
      aoTrocar={abrirSeletor}
      aoRemover={() => setConfirmando(true)}
    />
  ) : (
    <TimbradoVazio aoEscolher={aoEscolher} />
  );

  return (
    <div className="flex flex-col gap-4">
      {conteudo}
      {input}
      <ModalRemoverTimbrado
        aberto={confirmando}
        removendo={removendo}
        aoMudar={setConfirmando}
        aoConfirmar={remover}
      />
    </div>
  );
}
