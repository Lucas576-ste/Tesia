"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZonaUpload } from "@/components/zona-upload";
import { PreviaPeca } from "./previa-peca";

type Opcao = "padrao" | "proprio";

const opcoes: { valor: Opcao; rotulo: string; descricao: string }[] = [
  {
    valor: "padrao",
    rotulo: "Usar modelo padrão",
    descricao: "Você pode trocar pelo seu timbrado depois.",
  },
  {
    valor: "proprio",
    rotulo: "Enviar meu modelo",
    descricao: "Um arquivo .docx com o seu papel timbrado.",
  },
];

export function EscolhaModelo() {
  const [opcao, setOpcao] = useState<Opcao>("padrao");
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [erro, setErro] = useState(false);
  const faltaArquivo = opcao === "proprio" && !arquivo;

  function aoEscolher(arquivos: File[]) {
    const escolhido = arquivos[0];
    if (!escolhido) return;
    const valido = /\.docx$/i.test(escolhido.name);
    setErro(!valido);
    setArquivo(valido ? escolhido.name : null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Modelo de documento</legend>
            {opcoes.map(({ valor, rotulo, descricao }) => (
              <label
                key={valor}
                className="flex cursor-pointer items-start gap-2 rounded-md border bg-card p-3 text-sm has-checked:border-primaria has-checked:bg-primaria-fundo has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
              >
                <input
                  type="radio"
                  name="modelo"
                  checked={opcao === valor}
                  onChange={() => setOpcao(valor)}
                  className="mt-0.5 accent-primaria"
                />
                <span>
                  <span className="block font-medium">{rotulo}</span>
                  <span className="text-xs text-texto-secundario">{descricao}</span>
                </span>
              </label>
            ))}
          </fieldset>
          {opcao === "proprio" && (
            <>
              <ZonaUpload
                titulo="Arraste o .docx ou clique para escolher"
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
              {arquivo && (
                <p className="flex items-center gap-2 rounded-md border bg-card p-2 text-sm">
                  <FileText aria-hidden className="size-4 shrink-0 text-texto-secundario" />
                  <span className="min-w-0 break-all">{arquivo}</span>
                </p>
              )}
            </>
          )}
        </div>
        <PreviaPeca timbrado={opcao === "proprio"} />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        <Button asChild variant="ghost" className="sm:mr-auto">
          <Link href="/onboarding/estilo">Voltar</Link>
        </Button>
        {faltaArquivo ? (
          <Button disabled>Concluir e ir ao painel</Button>
        ) : (
          <Button asChild>
            <Link href="/app">Concluir e ir ao painel</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
