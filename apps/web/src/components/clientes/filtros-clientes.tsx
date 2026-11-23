"use client";

import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import { contarFiltrosExtras, SEM_FILTROS_EXTRAS, type FiltrosLista } from "@/lib/clientes-lista";
import { cn } from "@/lib/utils";

type FiltrosClientesProps = {
  filtros: FiltrosLista;
  ufs: string[];
  cidades: string[];
  aoMudar: (mudar: Partial<FiltrosLista>) => void;
};

function comAtual(opcoes: string[], atual: string | undefined) {
  return atual && !opcoes.some((opcao) => opcao.toLowerCase() === atual.toLowerCase())
    ? [...opcoes, atual]
    : opcoes;
}

function Campo({
  id,
  rotulo,
  children,
}: {
  id: string;
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-36 flex-col gap-1">
      <Label htmlFor={id} className="text-xs text-texto-secundario">
        {rotulo}
      </Label>
      {children}
    </div>
  );
}

export function FiltrosClientes({ filtros, ufs, cidades, aoMudar }: FiltrosClientesProps) {
  const ativos = contarFiltrosExtras(filtros);
  const [aberto, setAberto] = useState(ativos > 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-expanded={aberto}
          aria-controls="filtros-clientes"
          onClick={() => setAberto((valor) => !valor)}
        >
          Mais filtros{ativos > 0 ? ` (${ativos})` : ""}
          <ChevronDown aria-hidden className={cn("transition-transform", aberto && "rotate-180")} />
        </Button>
        <Button
          variant={filtros.aniversario === "hoje" ? "default" : "outline"}
          size="sm"
          aria-pressed={filtros.aniversario === "hoje"}
          onClick={() =>
            aoMudar({ aniversario: filtros.aniversario === "hoje" ? undefined : "hoje" })
          }
        >
          Aniversário hoje
        </Button>
        <Button
          variant={filtros.aniversario === "mes" ? "default" : "outline"}
          size="sm"
          aria-pressed={filtros.aniversario === "mes"}
          onClick={() =>
            aoMudar({ aniversario: filtros.aniversario === "mes" ? undefined : "mes" })
          }
        >
          Aniversário no mês
        </Button>
        {ativos > 0 && (
          <Button variant="ghost" size="sm" onClick={() => aoMudar(SEM_FILTROS_EXTRAS)}>
            <X aria-hidden />
            Limpar filtros
          </Button>
        )}
      </div>
      {aberto && (
        <div
          id="filtros-clientes"
          className="flex flex-wrap gap-3 rounded-xl border bg-card p-3 shadow-card"
        >
          <Campo id="filtro-processo" rotulo="Processos">
            <SelectNativo
              id="filtro-processo"
              value={filtros.processo ?? ""}
              onChange={(evento) =>
                aoMudar({
                  processo: (evento.target.value || undefined) as FiltrosLista["processo"],
                })
              }
            >
              <option value="">Com ou sem</option>
              <option value="com">Com processo</option>
              <option value="sem">Sem processo</option>
            </SelectNativo>
          </Campo>
          <Campo id="filtro-uf" rotulo="UF">
            <SelectNativo
              id="filtro-uf"
              value={filtros.uf ?? ""}
              onChange={(evento) => aoMudar({ uf: evento.target.value || undefined })}
            >
              <option value="">Todas</option>
              {comAtual(ufs, filtros.uf).map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </SelectNativo>
          </Campo>
          <Campo id="filtro-cidade" rotulo="Cidade">
            <SelectNativo
              id="filtro-cidade"
              value={filtros.cidade ?? ""}
              onChange={(evento) => aoMudar({ cidade: evento.target.value || undefined })}
            >
              <option value="">Todas</option>
              {comAtual(cidades, filtros.cidade).map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </SelectNativo>
          </Campo>
          <Campo id="filtro-de" rotulo="Cadastrado a partir de">
            <Input
              id="filtro-de"
              type="date"
              value={filtros.de ?? ""}
              max={filtros.ate}
              onChange={(evento) => aoMudar({ de: evento.target.value || undefined })}
            />
          </Campo>
          <Campo id="filtro-ate" rotulo="Cadastrado até">
            <Input
              id="filtro-ate"
              type="date"
              value={filtros.ate ?? ""}
              min={filtros.de}
              onChange={(evento) => aoMudar({ ate: evento.target.value || undefined })}
            />
          </Campo>
        </div>
      )}
    </div>
  );
}
