"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { buscarClienteParaEdicao } from "@/app/app/clientes/acoes";
import { Button } from "@/components/ui/button";
import type { DadosCliente } from "@/lib/cliente-tipos";
import { cn } from "@/lib/utils";
import { FormularioClienteCompleto } from "./formulario-cliente-completo";
import type { ModoDrawer } from "./provedor-cliente";
import { lerRascunhoCliente } from "./rascunho-cliente";

type DrawerProps = {
  modo: ModoDrawer;
  visivel: boolean;
  aoFechar: () => void;
  aoSalvo: (id: string) => void;
  aoDescartar: () => void;
  aoMudarRascunho: (rascunho: boolean) => void;
};

export function DrawerCliente({
  modo,
  visivel,
  aoFechar,
  aoSalvo,
  aoDescartar,
  aoMudarRascunho,
}: DrawerProps) {
  const edicao = modo.tipo === "edicao";
  const [valoresEdicao, setValoresEdicao] = useState<DadosCliente | null>(null);
  const [erroCarga, setErroCarga] = useState("");
  const [valoresNovo] = useState<Partial<DadosCliente>>(() =>
    modo.tipo === "novo"
      ? { tipo_pessoa: "pf", nacionalidade: "brasileiro(a)", ...lerRascunhoCliente() }
      : {},
  );

  useEffect(() => {
    if (modo.tipo !== "edicao") return;
    let ativo = true;
    buscarClienteParaEdicao(modo.id).then((resultado) => {
      if (!ativo) return;
      if ("erro" in resultado) setErroCarga(resultado.erro);
      else setValoresEdicao(resultado.valores);
    });
    return () => {
      ativo = false;
    };
  }, [modo]);

  useEffect(() => {
    if (!visivel) return;
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [visivel, aoFechar]);

  return (
    <aside
      role="dialog"
      aria-label={edicao ? "Editar cliente" : "Novo cliente"}
      aria-hidden={!visivel}
      inert={!visivel}
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l bg-card shadow-2xl transition-transform duration-200",
        visivel ? "translate-x-0" : "translate-x-full",
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b px-5 py-3">
        <div>
          <h2 className="text-lg font-semibold">{edicao ? "Editar cliente" : "Novo cliente"}</h2>
          {!edicao && (
            <p className="text-xs text-texto-secundario">
              Você pode navegar pelo site: o que digitou fica guardado.
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={aoFechar} aria-label="Fechar painel">
          <X aria-hidden />
        </Button>
      </header>
      {edicao && !valoresEdicao ? (
        <p className="p-5 text-sm text-texto-secundario">
          {erroCarga || "Carregando o cadastro..."}
        </p>
      ) : (
        <FormularioClienteCompleto
          valoresIniciais={edicao && valoresEdicao ? valoresEdicao : valoresNovo}
          clienteId={modo.tipo === "edicao" ? modo.id : undefined}
          aoSalvo={aoSalvo}
          aoFechar={aoFechar}
          aoDescartar={aoDescartar}
          aoMudarRascunho={aoMudarRascunho}
        />
      )}
    </aside>
  );
}
