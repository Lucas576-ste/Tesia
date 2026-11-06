"use client";

import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { feriadosExemplo, novoFeriadoSchema, type FeriadoProprio } from "@/lib/conta-exemplo";

function formatarData(iso: string) {
  return iso.split("-").reverse().join("/");
}

export function AbaCalendario() {
  const [feriados, setFeriados] = useState<FeriadoProprio[]>(feriadosExemplo);
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function adicionar(evento: FormEvent) {
    evento.preventDefault();
    const resultado = novoFeriadoSchema.safeParse({ data, descricao });
    if (!resultado.success) {
      setErro(resultado.error.issues[0]?.message ?? "Confira os dados.");
      return;
    }
    setFeriados((atuais) =>
      [...atuais, { ...resultado.data, id: crypto.randomUUID() }].sort((a, b) =>
        a.data.localeCompare(b.data),
      ),
    );
    setData("");
    setDescricao("");
    setErro(null);
    toast.success("Adicionado neste exemplo. A conta dos prazos não muda.");
  }

  return (
    <Card className="flex flex-col gap-4 p-4">
      <p className="text-sm text-texto-secundario">
        Feriados e suspensões do seu tribunal que não estão na lista da Tesia.
      </p>
      <form noValidate onSubmit={adicionar} className="grid gap-3 sm:grid-cols-[10rem_1fr_auto]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feriado-data">Data</Label>
          <Input
            id="feriado-data"
            type="date"
            value={data}
            onChange={(evento) => setData(evento.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feriado-descricao">Descrição</Label>
          <Input
            id="feriado-descricao"
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" className="self-end">
          Adicionar
        </Button>
      </form>
      {erro && (
        <p role="alert" className="text-sm text-erro">
          {erro}
        </p>
      )}
      {feriados.length === 0 ? (
        <p className="text-sm text-texto-secundario">Nenhum feriado próprio cadastrado.</p>
      ) : (
        <ul className="rounded-md border">
          {feriados.map(({ id, data: dia, descricao: texto }) => (
            <li key={id} className="flex items-center gap-3 border-b p-2 text-sm last:border-b-0">
              <span className="tabular-nums">{formatarData(dia)}</span>
              <span className="min-w-0 flex-1 break-words">{texto}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remover ${texto}`}
                onClick={() => setFeriados((atuais) => atuais.filter((item) => item.id !== id))}
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
