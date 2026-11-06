"use client";

import { FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PreviaPeca } from "@/components/onboarding/previa-peca";
import { Card } from "@/components/ui/card";
import { ZonaUpload } from "@/components/zona-upload";

export function AbaModelo() {
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  function aoEscolher(arquivos: File[]) {
    const escolhido = arquivos[0];
    if (!escolhido) return;
    const valido = /\.docx$/i.test(escolhido.name);
    setErro(!valido);
    if (!valido) return;
    setArquivo(escolhido.name);
    toast.success("Modelo trocado neste exemplo. Nada foi enviado.");
  }

  return (
    <Card className="grid gap-5 p-4 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-2 rounded-md border bg-card p-2 text-sm">
          <FileText aria-hidden className="size-4 shrink-0 text-texto-secundario" />
          <span className="min-w-0 break-all">{arquivo ?? "Modelo padrão da Tesia"}</span>
        </p>
        <ZonaUpload
          titulo="Trocar o .docx timbrado"
          descricao="Um arquivo com o seu timbrado"
          accept=".docx"
          multiple={false}
          aoEscolher={aoEscolher}
        />
        {erro && (
          <p role="alert" className="text-sm text-erro">
            Envie um arquivo .docx.
          </p>
        )}
      </div>
      <PreviaPeca timbrado={arquivo !== null} />
    </Card>
  );
}
