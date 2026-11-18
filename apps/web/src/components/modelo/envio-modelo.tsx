"use client";

import { CheckCircle2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { salvarModelo, usarModeloPadrao } from "@/app/app/configuracoes/modelo-acoes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ZonaUpload } from "@/components/zona-upload";
import { BUCKET_MODELOS, caminhoModelo, motivoRecusaModelo, TIPO_DOCX } from "@/lib/modelo-docx";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

export type DadosModelo = { escritorioId: string; usuarioId: string; temModelo: boolean };

function EstadoModelo({ temModelo }: { temModelo: boolean }) {
  if (temModelo) {
    return (
      <p
        role="status"
        className="flex items-start gap-2 rounded-md bg-sucesso-fundo p-3 text-sm text-sucesso"
      >
        <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0" />
        Seu timbrado está ativo. As peças baixadas saem com ele.
      </p>
    );
  }
  return (
    <p className="flex items-start gap-2 rounded-md border bg-card p-3 text-sm">
      <FileText aria-hidden className="mt-0.5 size-4 shrink-0 text-texto-secundario" />
      Usando o modelo padrão da Tesia (A4, Times 12, espaçamento 1,5).
    </p>
  );
}

export function EnvioModelo({ escritorioId, usuarioId, temModelo }: DadosModelo) {
  const [enviando, iniciar] = useTransition();
  const [confirmando, setConfirmando] = useState(false);
  const router = useRouter();

  function aoEscolher(arquivos: File[]) {
    const arquivo = arquivos[0];
    if (!arquivo) return;
    const motivo = motivoRecusaModelo(arquivo);
    if (motivo) {
      toast.error(motivo);
      return;
    }
    iniciar(async () => {
      const caminho = caminhoModelo(escritorioId, usuarioId);
      const { error } = await criarClienteNavegador()
        .storage.from(BUCKET_MODELOS)
        .upload(caminho, arquivo, { contentType: TIPO_DOCX });
      if (error) {
        toast.error("Falha no envio. Tente de novo.");
        return;
      }
      const resultado = await salvarModelo(caminho);
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Timbrado salvo. As peças baixadas saem com ele.");
      router.refresh();
    });
  }

  function remover() {
    iniciar(async () => {
      const resultado = await usarModeloPadrao();
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      setConfirmando(false);
      toast.success("Timbrado removido. As peças voltam a sair no modelo padrão.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <EstadoModelo temModelo={temModelo} />
      <ZonaUpload
        titulo={temModelo ? "Trocar o timbrado" : "Enviar meu .docx timbrado"}
        descricao="Usamos o cabeçalho, o rodapé, as fontes e as margens do seu arquivo"
        accept=".docx"
        multiple={false}
        aoEscolher={aoEscolher}
      />
      {enviando && (
        <p role="status" className="text-sm text-texto-secundario">
          Salvando...
        </p>
      )}
      {temModelo && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmando(true)}
          disabled={enviando}
          className="w-fit text-texto-secundario"
        >
          Remover meu timbrado
        </Button>
      )}
      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover o timbrado?</DialogTitle>
            <DialogDescription>
              As próximas peças baixadas saem no modelo padrão da Tesia. Você pode enviar o timbrado
              de novo quando quiser.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={remover} disabled={enviando}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
