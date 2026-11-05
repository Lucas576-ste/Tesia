"use client";

import { FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { processosExemplo } from "@/components/layout/dados-exemplo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import { ZonaUpload } from "@/components/zona-upload";
import { ETAPAS, EtapasAnalise } from "./etapas-analise";

const DURACAO_ETAPA = 900;

type Arquivo = { id: number; nome: string };

export function EnvioIntimacao() {
  const router = useRouter();
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [recusados, setRecusados] = useState(0);
  const [etapa, setEtapa] = useState<number | null>(null);
  const proximoId = useRef(0);
  const temporizadores = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const ativos = temporizadores.current;
    return () => ativos.forEach(clearTimeout);
  }, []);

  function adicionar(novos: File[]) {
    const pdfs = novos.filter(({ name }) => /\.pdf$/i.test(name));
    setRecusados(novos.length - pdfs.length);
    setArquivos((atuais) => [
      ...atuais,
      ...pdfs.map(({ name }) => ({ id: proximoId.current++, nome: name })),
    ]);
  }

  function analisar() {
    setEtapa(0);
    ETAPAS.forEach((_, indice) => {
      temporizadores.current.push(
        setTimeout(() => setEtapa(indice + 1), DURACAO_ETAPA * (indice + 1)),
      );
    });
    temporizadores.current.push(
      setTimeout(() => router.push("/app/intimacoes/1"), DURACAO_ETAPA * ETAPAS.length + 300),
    );
  }

  if (etapa !== null) return <EtapasAnalise atual={etapa} />;

  return (
    <div className="flex flex-col gap-4">
      <ZonaUpload
        titulo="Arraste os PDFs ou clique para escolher"
        descricao="Uma ou várias intimações"
        accept=".pdf,application/pdf"
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
          {arquivos.map(({ id, nome }) => (
            <li key={id} className="flex items-center gap-2 rounded-md border bg-card p-2 text-sm">
              <FileText aria-hidden className="size-4 shrink-0 text-erro" />
              <span className="min-w-0 flex-1 break-all">{nome}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remover ${nome}`}
                onClick={() =>
                  setArquivos((atuais) => atuais.filter((arquivo) => arquivo.id !== id))
                }
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="processo">Vincular a um processo (opcional)</Label>
        <SelectNativo id="processo" defaultValue="">
          <option value="">Identificar pelo documento</option>
          {processosExemplo.map(({ id, partes }) => (
            <option key={id} value={id}>
              {partes}
            </option>
          ))}
        </SelectNativo>
      </div>
      <Button
        disabled={arquivos.length === 0}
        onClick={analisar}
        className="w-full sm:w-auto sm:self-end"
      >
        Analisar
      </Button>
    </div>
  );
}
