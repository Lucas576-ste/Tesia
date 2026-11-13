"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  consultarPecasEstilo,
  registrarPecaEstilo,
  removerPecaEstilo,
} from "@/app/app/estilo/acoes";
import {
  BUCKET_ESTILO,
  caminhoPecaEstilo,
  extensaoPeca,
  MAXIMO_PECAS_ESTILO,
  motivoRecusaPeca,
  tipoDoArquivo,
  type PecaEstilo,
} from "@/lib/estilo";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

const INTERVALO_MS = 2000;

function hojeFormatado() {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function usePecasEstilo(escritorioId: string, usuarioId: string, iniciais: PecaEstilo[]) {
  const [pecas, setPecas] = useState(iniciais);
  const pendentes = pecas.filter(
    ({ status, temporaria }) => status === "processando" && !temporaria,
  );
  const chavePendentes = pendentes.map(({ id }) => id).join(",");

  useEffect(() => {
    if (!chavePendentes) return;
    const intervalo = setInterval(async () => {
      const atualizadas = await consultarPecasEstilo(chavePendentes.split(","));
      setPecas((atuais) =>
        atuais.map((peca) => atualizadas.find(({ id }) => id === peca.id) ?? peca),
      );
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [chavePendentes]);

  function atualizar(id: string, mudancas: Partial<PecaEstilo>) {
    setPecas((atuais) => atuais.map((peca) => (peca.id === id ? { ...peca, ...mudancas } : peca)));
  }

  async function enviar(arquivo: File, idTemporario: string) {
    const extensao = extensaoPeca(arquivo.name);
    if (!extensao) return;
    const caminho = caminhoPecaEstilo(escritorioId, usuarioId, extensao);
    const { error } = await criarClienteNavegador()
      .storage.from(BUCKET_ESTILO)
      .upload(caminho, arquivo, { contentType: tipoDoArquivo(extensao) });
    if (error)
      return atualizar(idTemporario, { status: "erro", erro: "Falha no envio. Tente de novo." });
    const resultado = await registrarPecaEstilo(caminho, arquivo.name);
    if ("erro" in resultado)
      return atualizar(idTemporario, { status: "erro", erro: resultado.erro });
    atualizar(idTemporario, { id: resultado.id, status: "processando", temporaria: false });
  }

  function adicionar(arquivos: File[]) {
    let vagas = MAXIMO_PECAS_ESTILO - pecas.filter(({ status }) => status !== "erro").length;
    const novas = arquivos.map<PecaEstilo>((arquivo) => {
      const base = {
        id: crypto.randomUUID(),
        nome: arquivo.name,
        data: hojeFormatado(),
        trechos: 0,
        temporaria: true,
      };
      const motivo = motivoRecusaPeca(arquivo);
      if (motivo) return { ...base, status: "erro", erro: motivo };
      if (vagas <= 0)
        return { ...base, status: "erro", erro: `Limite de ${MAXIMO_PECAS_ESTILO} peças` };
      vagas -= 1;
      void enviar(arquivo, base.id);
      return { ...base, status: "enviando" };
    });
    setPecas((atuais) => [...atuais, ...novas]);
  }

  async function remover(id: string) {
    const peca = pecas.find((item) => item.id === id);
    if (!peca) return;
    if (peca.temporaria) {
      setPecas((atuais) => atuais.filter((item) => item.id !== id));
      return;
    }
    const resultado = await removerPecaEstilo(id);
    if ("erro" in resultado) {
      toast.error(resultado.erro);
      return;
    }
    setPecas((atuais) => atuais.filter((item) => item.id !== id));
    toast.success("Peça removida.");
  }

  return {
    pecas,
    adicionar,
    remover,
    lidas: pecas.filter(({ status }) => status === "lido").length,
    validas: pecas.filter(({ status }) => status !== "erro").length,
  };
}
