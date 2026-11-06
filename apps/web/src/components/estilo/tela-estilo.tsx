"use client";

import { FileText, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EstadoVazio } from "@/components/estado-vazio";
import { PainelAprendizado } from "@/components/onboarding/painel-aprendizado";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ZonaUpload } from "@/components/zona-upload";
import {
  FORMATOS_PECA_ESTILO,
  MAXIMO_PECAS_ESTILO,
  MINIMO_PECAS_ESTILO,
  type PecaEstilo,
} from "@/lib/estilo-exemplo";

const HOJE_EXEMPLO = "04/11/2026";

export function TelaEstilo({ pecasIniciais }: { pecasIniciais: PecaEstilo[] }) {
  const [pecas, setPecas] = useState(pecasIniciais);
  const [mudou, setMudou] = useState(false);
  const [usarRevisadas, setUsarRevisadas] = useState(true);

  function adicionar(arquivos: File[]) {
    const validos = arquivos.filter(({ name }) => FORMATOS_PECA_ESTILO.test(name));
    if (validos.length < arquivos.length) toast.error("Envie peças em PDF ou Word.");
    const vagas = MAXIMO_PECAS_ESTILO - pecas.length;
    if (validos.length > vagas) toast.error(`O limite é de ${MAXIMO_PECAS_ESTILO} peças.`);
    const novas = validos.slice(0, Math.max(vagas, 0)).map((arquivo) => ({
      id: crypto.randomUUID(),
      nome: arquivo.name,
      data: HOJE_EXEMPLO,
    }));
    if (novas.length === 0) return;
    setPecas((atuais) => [...atuais, ...novas]);
    setMudou(true);
  }

  function remover(id: string) {
    setPecas((atuais) => atuais.filter((peca) => peca.id !== id));
    setMudou(true);
  }

  function atualizar() {
    setMudou(false);
    toast.success("Estilo atualizado neste exemplo. Nada foi enviado.");
  }

  return (
    <div className="grid items-start gap-4 md:grid-cols-[1fr_20rem]">
      <div className="flex flex-col gap-4">
        <ZonaUpload
          titulo="Adicionar peças"
          descricao={`De ${MINIMO_PECAS_ESTILO} a ${MAXIMO_PECAS_ESTILO} peças em PDF ou Word`}
          accept=".pdf,.doc,.docx"
          aoEscolher={adicionar}
        />
        {pecas.length < MINIMO_PECAS_ESTILO && (
          <p role="status" className="rounded-md bg-atencao-fundo px-3 py-2 text-sm text-atencao">
            Com menos de {MINIMO_PECAS_ESTILO} peças, o rascunho fica mais genérico.
          </p>
        )}
        {pecas.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma peça enviada"
            descricao="Adicione suas peças para a Lia aprender o seu estilo."
          />
        ) : (
          <Card className="gap-0 py-0">
            <ul>
              {pecas.map(({ id, nome, data }) => (
                <li
                  key={id}
                  className="flex items-center gap-2 border-b p-3 text-sm last:border-b-0"
                >
                  <FileText aria-hidden className="size-4 shrink-0 text-texto-secundario" />
                  <span className="min-w-0 flex-1 break-all">{nome}</span>
                  <span className="hidden text-xs text-texto-secundario tabular-nums sm:inline">
                    {data}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remover ${nome}`}
                    onClick={() => remover(id)}
                  >
                    <X aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <PainelAprendizado />
        <Button disabled={!mudou} onClick={atualizar}>
          Atualizar meu estilo
        </Button>
        <label className="flex cursor-pointer items-start gap-2 rounded-md border bg-card p-3 text-sm has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50">
          <input
            type="checkbox"
            checked={usarRevisadas}
            onChange={(evento) => setUsarRevisadas(evento.target.checked)}
            className="mt-0.5 accent-primaria"
          />
          Usar as peças que eu revisar na Tesia para melhorar o meu estilo
        </label>
      </div>
    </div>
  );
}
