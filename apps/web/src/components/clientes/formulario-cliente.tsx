"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DadosCliente } from "@/lib/cliente-tipos";

type FormularioClienteProps = {
  inicial: DadosCliente;
  aoSalvar: (dados: DadosCliente) => Promise<boolean>;
  rotulo?: string;
};

const campos = [
  { chave: "nome", rotulo: "Nome", tipo: "text" },
  { chave: "documento", rotulo: "CPF ou CNPJ (opcional)", tipo: "text" },
  { chave: "telefone", rotulo: "Telefone (opcional)", tipo: "tel" },
  { chave: "email", rotulo: "E-mail (opcional)", tipo: "email" },
] as const;

export function FormularioCliente({
  inicial,
  aoSalvar,
  rotulo = "Salvar",
}: FormularioClienteProps) {
  const [dados, setDados] = useState(inicial);
  const [salvando, iniciar] = useTransition();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(evento) => {
        evento.preventDefault();
        iniciar(async () => {
          await aoSalvar(dados);
        });
      }}
    >
      {campos.map(({ chave, rotulo: texto, tipo }) => (
        <div key={chave} className="flex flex-col gap-1.5">
          <Label htmlFor={`cliente-${chave}`}>{texto}</Label>
          <Input
            id={`cliente-${chave}`}
            type={tipo}
            value={dados[chave] ?? ""}
            onChange={(evento) => setDados((atual) => ({ ...atual, [chave]: evento.target.value }))}
          />
        </div>
      ))}
      <Button
        type="submit"
        disabled={salvando || (dados.nome ?? "").trim().length < 2}
        className="self-end"
      >
        {salvando ? "Salvando..." : rotulo}
      </Button>
    </form>
  );
}
