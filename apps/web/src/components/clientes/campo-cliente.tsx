"use client";

import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { DadosCliente, DadosClienteValidados } from "@/lib/cliente-tipos";
import { cn } from "@/lib/utils";

export type FormularioCliente = UseFormReturn<DadosCliente, unknown, DadosClienteValidados>;

export type CampoTextoCliente =
  | "nome"
  | "documento"
  | "celular"
  | "email"
  | "data_nascimento"
  | "profissao"
  | "nacionalidade"
  | "rg"
  | "rg_orgao"
  | "nome_fantasia"
  | "cep"
  | "logradouro"
  | "numero"
  | "complemento"
  | "bairro"
  | "cidade"
  | "uf";

type CampoProps = {
  form: FormularioCliente;
  nome: CampoTextoCliente;
  rotulo: string;
  tipo?: "text" | "email" | "tel" | "date";
  mascara?: (valor: string) => string;
  aoMudar?: (valor: string) => void;
  aoSair?: () => void;
  obrigatorio?: boolean;
  className?: string;
  autoFocus?: boolean;
  modoEntrada?: "numeric" | "text";
  placeholder?: string;
};

export function CampoCliente({
  form,
  nome,
  rotulo,
  tipo = "text",
  mascara,
  aoMudar,
  aoSair,
  obrigatorio,
  className,
  autoFocus,
  modoEntrada,
  placeholder,
}: CampoProps) {
  return (
    <FormField
      control={form.control}
      name={nome}
      render={({ field }) => (
        <FormItem className={cn("min-w-0", className)}>
          <FormLabel>
            {rotulo}
            {obrigatorio && (
              <span aria-hidden className="text-erro">
                {" "}
                *
              </span>
            )}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={tipo}
              value={field.value ?? ""}
              autoFocus={autoFocus}
              inputMode={modoEntrada}
              placeholder={placeholder}
              autoComplete="off"
              onChange={(evento) => {
                const valor = mascara ? mascara(evento.target.value) : evento.target.value;
                field.onChange(valor);
                aoMudar?.(valor);
              }}
              onBlur={() => {
                field.onBlur();
                aoSair?.();
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
