"use client";

import { mascararDocumento } from "@tesia/shared";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DadosCliente } from "@/lib/cliente-tipos";
import { cn } from "@/lib/utils";

type FormularioClienteProps = {
  inicial: DadosCliente;
  aoSalvar: (dados: DadosCliente) => Promise<boolean>;
  rotulo?: string;
};

const tipos = [
  { valor: "pf", rotulo: "Pessoa física" },
  { valor: "pj", rotulo: "Pessoa jurídica" },
] as const;

export function FormularioCliente({
  inicial,
  aoSalvar,
  rotulo = "Salvar",
}: FormularioClienteProps) {
  const [dados, setDados] = useState({
    ...inicial,
    documento: mascararDocumento(inicial.documento ?? "", inicial.tipo_pessoa ?? "pf"),
  });
  const [salvando, iniciar] = useTransition();
  const tipo = dados.tipo_pessoa ?? "pf";
  const campos = [
    { chave: "nome", rotulo: tipo === "pf" ? "Nome completo" : "Razão social", tipo: "text" },
    {
      chave: "documento",
      rotulo: tipo === "pf" ? "CPF (opcional)" : "CNPJ (opcional)",
      tipo: "text",
    },
    { chave: "telefone", rotulo: "WhatsApp (opcional)", tipo: "tel" },
    { chave: "email", rotulo: "E-mail (opcional)", tipo: "email" },
  ] as const;

  function mudar(chave: (typeof campos)[number]["chave"], valor: string) {
    setDados((atual) => ({
      ...atual,
      [chave]: chave === "documento" ? mascararDocumento(valor, tipo) : valor,
    }));
  }

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
      <div
        role="radiogroup"
        aria-label="Tipo de cliente"
        className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
      >
        {tipos.map(({ valor, rotulo: texto }) => (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={tipo === valor}
            onClick={() => setDados((atual) => ({ ...atual, tipo_pessoa: valor, documento: "" }))}
            className={cn(
              "rounded-md py-1.5 text-sm font-medium text-texto-secundario",
              tipo === valor && "bg-card text-foreground shadow-xs",
            )}
          >
            {texto}
          </button>
        ))}
      </div>
      {campos.map(({ chave, rotulo: texto, tipo: tipoCampo }) => (
        <div key={chave} className="flex flex-col gap-1.5">
          <Label htmlFor={`cliente-${chave}`}>{texto}</Label>
          <Input
            id={`cliente-${chave}`}
            type={tipoCampo}
            inputMode={chave === "documento" ? "numeric" : undefined}
            value={dados[chave] ?? ""}
            onChange={(evento) => mudar(chave, evento.target.value)}
          />
        </div>
      ))}
      <p className="text-xs text-texto-secundario">
        RG, endereço e o restante da qualificação podem ser preenchidos depois, na página do
        cliente.
      </p>
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
