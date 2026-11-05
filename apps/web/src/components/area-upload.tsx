"use client";

import { FileText, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZonaUpload } from "@/components/zona-upload";

function chaveArquivo(arquivo: File) {
  return `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`;
}

export function AreaUpload() {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [recusados, setRecusados] = useState(0);

  function adicionar(novos: File[]) {
    const pdfs = novos.filter((arquivo) => arquivo.type === "application/pdf");
    setRecusados(novos.length - pdfs.length);
    setArquivos((atuais) => {
      const chaves = new Set(atuais.map(chaveArquivo));
      return [...atuais, ...pdfs.filter((arquivo) => !chaves.has(chaveArquivo(arquivo)))];
    });
  }

  function remover(chave: string) {
    setArquivos((atuais) => atuais.filter((arquivo) => chaveArquivo(arquivo) !== chave));
  }

  return (
    <div className="flex flex-col gap-3">
      <ZonaUpload
        titulo="Arraste os PDFs ou clique para escolher"
        descricao="Uma ou várias intimações"
        accept="application/pdf"
        aoEscolher={adicionar}
      />
      {recusados > 0 && (
        <p role="alert" className="text-sm text-erro">
          {recusados === 1 ? "1 arquivo recusado" : `${recusados} arquivos recusados`}: envie apenas
          PDF.
        </p>
      )}
      {arquivos.length > 0 && (
        <ul className="flex flex-col gap-2">
          {arquivos.map((arquivo) => {
            const chave = chaveArquivo(arquivo);
            return (
              <li key={chave} className="flex items-center gap-2 rounded-md border bg-card p-2">
                <FileText aria-hidden className="size-4 shrink-0 text-texto-secundario" />
                <span className="min-w-0 flex-1 truncate text-sm">{arquivo.name}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover ${arquivo.name}`}
                  onClick={() => remover(chave)}
                >
                  <X aria-hidden />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
