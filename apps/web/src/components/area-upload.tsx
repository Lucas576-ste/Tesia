"use client";

import { FileText, Upload, X } from "lucide-react";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function chaveArquivo(arquivo: File) {
  return `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`;
}

export function AreaUpload() {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [recusados, setRecusados] = useState(0);

  function adicionar(novos: File[]) {
    const pdfs = novos.filter((arquivo) => arquivo.type === "application/pdf");
    setRecusados(novos.length - pdfs.length);
    setArquivos((atuais) => {
      const chaves = new Set(atuais.map(chaveArquivo));
      return [...atuais, ...pdfs.filter((arquivo) => !chaves.has(chaveArquivo(arquivo)))];
    });
  }

  function aoSoltar(evento: DragEvent<HTMLLabelElement>) {
    evento.preventDefault();
    setArrastando(false);
    adicionar(Array.from(evento.dataTransfer.files));
  }

  function aoEscolher(evento: ChangeEvent<HTMLInputElement>) {
    adicionar(Array.from(evento.target.files ?? []));
    evento.target.value = "";
  }

  function remover(chave: string) {
    setArquivos((atuais) => atuais.filter((arquivo) => chaveArquivo(arquivo) !== chave));
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        onDragOver={(evento) => {
          evento.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={aoSoltar}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-borda-upload bg-card p-5 text-center transition-colors focus-within:ring-[3px] focus-within:ring-ring/50 hover:border-primaria",
          arrastando && "border-primaria bg-primaria/5",
        )}
      >
        <Upload aria-hidden className="size-6 text-primaria" />
        <span className="text-sm font-medium">Arraste os PDFs ou clique para escolher</span>
        <span className="text-xs text-texto-secundario">Uma ou várias intimações</span>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={aoEscolher}
          className="sr-only"
        />
      </label>
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
