"use client";

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { salvarModelo, usarModeloPadrao } from "@/app/app/configuracoes/modelo-acoes";
import { Button } from "@/components/ui/button";
import { ZonaUpload } from "@/components/zona-upload";
import { BUCKET_MODELOS, caminhoModelo, motivoRecusaModelo, TIPO_DOCX } from "@/lib/modelo-docx";
import { criarClienteNavegador } from "@/lib/supabase/navegador";

export type DadosModelo = { escritorioId: string; usuarioId: string; temModelo: boolean };

export function EnvioModelo({ escritorioId, usuarioId, temModelo }: DadosModelo) {
  const [enviando, iniciar] = useTransition();
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
      toast.success("Modelo salvo. As próximas peças saem com o seu timbrado.");
      router.refresh();
    });
  }

  function voltarAoPadrao() {
    iniciar(async () => {
      const resultado = await usarModeloPadrao();
      if ("erro" in resultado) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Voltamos ao modelo padrão da Tesia.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 rounded-md border bg-card p-2 text-sm">
        <FileText aria-hidden className="size-4 shrink-0 text-texto-secundario" />
        <span className="min-w-0 flex-1 break-all">
          {temModelo
            ? "Seu timbrado (.docx)"
            : "Modelo padrão da Tesia (A4, Times 12, espaçamento 1,5)"}
        </span>
      </p>
      <ZonaUpload
        titulo={temModelo ? "Trocar o .docx timbrado" : "Enviar meu .docx timbrado"}
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
        <Button variant="outline" onClick={voltarAoPadrao} disabled={enviando} className="w-fit">
          Usar o modelo padrão
        </Button>
      )}
    </div>
  );
}
