"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type FormularioDemonstracaoProps = {
  textoBotao: string;
  depoisDeEnviar?: ReactNode;
  children: ReactNode;
};

export function FormularioDemonstracao({
  textoBotao,
  depoisDeEnviar,
  children,
}: FormularioDemonstracaoProps) {
  const [enviado, setEnviado] = useState(false);

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviado(true);
  }

  return (
    <form onSubmit={aoEnviar} className="flex flex-col gap-3">
      <p className="rounded-md bg-atencao-fundo px-3 py-2 text-xs text-atencao">
        Demonstração: nenhum dado é enviado. Não digite uma senha real.
      </p>
      {children}
      <Button type="submit" className="w-full">
        {textoBotao}
      </Button>
      {enviado && (
        <div role="status" className="flex flex-col gap-1 text-sm text-texto-secundario">
          <p>Nada foi enviado: o acesso real ainda não está ligado.</p>
          {depoisDeEnviar}
        </div>
      )}
    </form>
  );
}
