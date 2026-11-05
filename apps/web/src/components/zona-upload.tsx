"use client";

import { Upload } from "lucide-react";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { cn } from "@/lib/utils";

type ZonaUploadProps = {
  titulo: string;
  descricao: string;
  accept: string;
  multiple?: boolean;
  aoEscolher: (arquivos: File[]) => void;
};

export function ZonaUpload({
  titulo,
  descricao,
  accept,
  multiple = true,
  aoEscolher,
}: ZonaUploadProps) {
  const [arrastando, setArrastando] = useState(false);

  function aoSoltar(evento: DragEvent<HTMLLabelElement>) {
    evento.preventDefault();
    setArrastando(false);
    aoEscolher(Array.from(evento.dataTransfer.files));
  }

  function aoSelecionar(evento: ChangeEvent<HTMLInputElement>) {
    aoEscolher(Array.from(evento.target.files ?? []));
    evento.target.value = "";
  }

  return (
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
      <span className="text-sm font-medium">{titulo}</span>
      <span className="text-xs text-texto-secundario">{descricao}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={aoSelecionar}
        className="sr-only"
      />
    </label>
  );
}
