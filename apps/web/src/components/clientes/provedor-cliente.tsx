"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DrawerCliente } from "./drawer-cliente";
import { limparRascunhoCliente } from "./rascunho-cliente";

export type ModoDrawer = { tipo: "novo" } | { tipo: "edicao"; id: string };

type ContextoCliente = {
  abrirNovo: () => void;
  abrirEdicao: (id: string) => void;
  rascunho: boolean;
};

const Contexto = createContext<ContextoCliente | null>(null);

export function useDrawerCliente() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useDrawerCliente precisa do ProvedorCliente");
  return contexto;
}

export function ProvedorCliente({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [modo, setModo] = useState<ModoDrawer | null>(null);
  const [visivel, setVisivel] = useState(false);
  const [rascunho, setRascunho] = useState(false);

  const abrirNovo = useCallback(() => {
    setModo((atual) => (atual?.tipo === "novo" ? atual : { tipo: "novo" }));
    setVisivel(true);
  }, []);

  const abrirEdicao = useCallback((id: string) => {
    setModo({ tipo: "edicao", id });
    setVisivel(true);
  }, []);

  const aoSalvo = useCallback(
    (id: string) => {
      const foiNovo = modo?.tipo === "novo";
      setModo(null);
      setVisivel(false);
      setRascunho(false);
      if (foiNovo) {
        limparRascunhoCliente();
        router.push(`/app/clientes?aba=processos&novo=1&cliente=${id}`);
      } else {
        router.refresh();
      }
    },
    [modo, router],
  );

  const aoDescartar = useCallback(() => {
    limparRascunhoCliente();
    setModo(null);
    setVisivel(false);
    setRascunho(false);
  }, []);

  const valor = useMemo(
    () => ({ abrirNovo, abrirEdicao, rascunho: rascunho && !visivel }),
    [abrirNovo, abrirEdicao, rascunho, visivel],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      {modo && (
        <DrawerCliente
          key={modo.tipo === "novo" ? "novo" : modo.id}
          modo={modo}
          visivel={visivel}
          aoFechar={() => setVisivel(false)}
          aoSalvo={aoSalvo}
          aoDescartar={aoDescartar}
          aoMudarRascunho={setRascunho}
        />
      )}
    </Contexto.Provider>
  );
}
