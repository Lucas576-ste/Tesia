"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { processosExemplo } from "./dados-exemplo";

function normalizarBusca(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[.-]/g, "")
    .toLowerCase();
}

function filtrarProcessos(valor: string, busca: string) {
  return normalizarBusca(valor).includes(normalizarBusca(busca)) ? 1 : 0;
}

export function BuscaGlobal() {
  const [aberta, setAberta] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function aoPressionar(evento: KeyboardEvent) {
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
        evento.preventDefault();
        setAberta((atual) => !atual);
      }
    }

    document.addEventListener("keydown", aoPressionar);
    return () => document.removeEventListener("keydown", aoPressionar);
  }, []);

  function abrirProcesso(id: string) {
    setAberta(false);
    router.push(`/app/processos/${id}`);
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label="Buscar processo"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => setAberta(true)}
        className="text-texto-secundario lg:w-64 lg:justify-start lg:px-3"
      >
        <Search aria-hidden />
        <span className="hidden flex-1 text-left font-normal lg:inline">Buscar processo</span>
        <kbd className="hidden rounded border px-1.5 font-sans text-xs lg:inline">Ctrl K</kbd>
      </Button>
      <CommandDialog
        title="Buscar processo"
        description="Busque por número ou nome da parte."
        open={aberta}
        onOpenChange={setAberta}
        filter={filtrarProcessos}
      >
        <CommandInput placeholder="Número do processo ou nome da parte" />
        <CommandList>
          <CommandEmpty>Nenhum processo encontrado.</CommandEmpty>
          <CommandGroup heading="Processos">
            {processosExemplo.map(({ id, cnj, partes }) => (
              <CommandItem key={id} value={`${partes} ${cnj}`} onSelect={() => abrirProcesso(id)}>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{partes}</span>
                  <span className="text-xs text-texto-secundario tabular-nums">{cnj}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
