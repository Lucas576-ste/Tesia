"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  mascaraTelefoneEntrada,
  mascararDocumento,
  ORIGENS,
  somenteDigitos,
  validarCnpj,
  validarCpf,
} from "@tesia/shared";
import { ChevronDown, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  clientesParaRepresentante,
  consultarCnpj,
  criarCliente,
  editarCliente,
  verificarDocumento,
} from "@/app/app/clientes/acoes";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { DadosCnpj } from "@/lib/brasilapi";
import {
  dadosClienteSchema,
  type DadosCliente,
  type DadosClienteValidados,
} from "@/lib/cliente-tipos";
import { consultarCep } from "@/lib/viacep";
import { cn } from "@/lib/utils";
import { CampoCliente, type CampoTextoCliente } from "./campo-cliente";
import { salvarRascunhoCliente } from "./rascunho-cliente";
import { SecaoDadosAdicionais } from "./secao-dados-adicionais";

type FormularioProps = {
  valoresIniciais: Partial<DadosCliente>;
  clienteId?: string;
  aoSalvo: (id: string) => void;
  aoFechar: () => void;
  aoDescartar: () => void;
  aoMudarRascunho: (rascunho: boolean) => void;
};

const TIPOS = [
  { valor: "pf", rotulo: "Pessoa física" },
  { valor: "pj", rotulo: "Pessoa jurídica" },
] as const;

type Duplicado = { id: string; nome: string };

export function FormularioClienteCompleto({
  valoresIniciais,
  clienteId,
  aoSalvo,
  aoFechar,
  aoDescartar,
  aoMudarRascunho,
}: FormularioProps) {
  const form = useForm<DadosCliente, unknown, DadosClienteValidados>({
    resolver: zodResolver(dadosClienteSchema),
    defaultValues: valoresIniciais,
  });
  const tipo = useWatch({ control: form.control, name: "tipo_pessoa" }) ?? "pf";
  const [adicionaisAbertos, setAdicionaisAbertos] = useState(false);
  const [representantes, setRepresentantes] = useState<Duplicado[]>([]);
  const [consultando, setConsultando] = useState(false);
  const [duplicado, setDuplicado] = useState<Duplicado | null>(null);
  const [erroGeral, setErroGeral] = useState("");
  const carregouRepresentantes = useRef(false);

  useEffect(() => {
    if (!adicionaisAbertos || carregouRepresentantes.current) return;
    carregouRepresentantes.current = true;
    clientesParaRepresentante().then(setRepresentantes);
  }, [adicionaisAbertos]);

  useEffect(() => {
    const assinatura = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        if (!clienteId) salvarRascunhoCliente(values);
        aoMudarRascunho(Boolean((values.nome ?? "").trim() || (values.documento ?? "").trim()));
      },
    });
    return assinatura;
  }, [form, clienteId, aoMudarRascunho]);

  function preencherVazios(dados: DadosCnpj) {
    const campos: [CampoTextoCliente, string][] = [
      ["nome", dados.nome],
      ["nome_fantasia", dados.nome_fantasia],
      ["email", dados.email],
      ["celular", dados.celular],
      ["cep", dados.cep],
      ["logradouro", dados.logradouro],
      ["numero", dados.numero],
      ["complemento", dados.complemento],
      ["bairro", dados.bairro],
      ["cidade", dados.cidade],
      ["uf", dados.uf],
    ];
    for (const [nome, valor] of campos) {
      if (valor && !String(form.getValues(nome) ?? "").trim()) {
        form.setValue(nome, valor, { shouldDirty: true });
      }
    }
    setAdicionaisAbertos(true);
  }

  async function aoSairDoDocumento() {
    const digitos = somenteDigitos(form.getValues("documento") ?? "");
    setDuplicado(null);
    if (!digitos) return;
    const tipoDetectado = digitos.length === 14 ? "pj" : digitos.length === 11 ? "pf" : tipo;
    if (tipoDetectado !== tipo) form.setValue("tipo_pessoa", tipoDetectado);
    const valido = tipoDetectado === "pf" ? validarCpf(digitos) : validarCnpj(digitos);
    if (!valido) {
      form.setError("documento", {
        message: tipoDetectado === "pf" ? "CPF inválido." : "CNPJ inválido.",
      });
      return;
    }
    form.clearErrors("documento");
    form.setValue("documento", mascararDocumento(digitos, tipoDetectado));
    const verificacao = await verificarDocumento(digitos, clienteId);
    if ("ok" in verificacao && verificacao.existente) {
      setDuplicado(verificacao.existente);
      form.setError("documento", {
        message: `Já existe um cliente com este documento: ${verificacao.existente.nome}.`,
      });
      return;
    }
    if (tipoDetectado === "pj") {
      setConsultando(true);
      const consulta = await consultarCnpj(digitos);
      setConsultando(false);
      if ("erro" in consulta) {
        toast.message(consulta.erro);
        return;
      }
      preencherVazios(consulta.dados);
      toast.success("Dados preenchidos pela Receita Federal.");
    }
  }

  async function aoMudarCep(valor: string) {
    if (somenteDigitos(valor).length !== 8) return;
    const endereco = await consultarCep(valor);
    if (!endereco) return;
    const campos: [CampoTextoCliente, string][] = [
      ["logradouro", endereco.logradouro],
      ["bairro", endereco.bairro],
      ["cidade", endereco.cidade],
      ["uf", endereco.uf],
    ];
    for (const [nome, texto] of campos) {
      if (texto && !String(form.getValues(nome) ?? "").trim()) form.setValue(nome, texto);
    }
  }

  const enviar = form.handleSubmit(async () => {
    setErroGeral("");
    const valores = form.getValues();
    const resultado = clienteId
      ? await editarCliente(clienteId, valores)
      : await criarCliente(valores);
    if ("erro" in resultado) {
      setErroGeral(resultado.erro);
      setDuplicado(resultado.duplicado ?? null);
      return;
    }
    toast.success(clienteId ? "Cliente atualizado." : "Cliente cadastrado.");
    aoSalvo(resultado.id);
  });

  return (
    <Form {...form}>
      <form noValidate onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <CampoCliente
            form={form}
            nome="nome"
            rotulo={tipo === "pf" ? "Nome completo" : "Razão social"}
            obrigatorio
            autoFocus={!clienteId}
          />
          <FormField
            control={form.control}
            name="origem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Origem
                  <span aria-hidden className="text-erro">
                    {" "}
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <SelectNativo {...field} value={field.value ?? ""}>
                    <option value="">Escolha como o cliente chegou</option>
                    {Object.entries(ORIGENS).map(([valor, rotulo]) => (
                      <option key={valor} value={valor}>
                        {rotulo}
                      </option>
                    ))}
                  </SelectNativo>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div
            role="radiogroup"
            aria-label="Tipo de cliente"
            className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
          >
            {TIPOS.map(({ valor, rotulo }) => (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={tipo === valor}
                onClick={() => {
                  form.setValue("tipo_pessoa", valor);
                  form.setValue("documento", "");
                  setDuplicado(null);
                }}
                className={cn(
                  "rounded-md py-1.5 text-sm font-medium text-texto-secundario",
                  tipo === valor && "bg-card text-foreground shadow-xs",
                )}
              >
                {rotulo}
              </button>
            ))}
          </div>
          <div className="relative">
            <CampoCliente
              form={form}
              nome="documento"
              rotulo={tipo === "pf" ? "CPF" : "CNPJ"}
              modoEntrada="numeric"
              mascara={(valor) => mascararDocumento(valor, tipo)}
              aoSair={aoSairDoDocumento}
            />
            {consultando && (
              <span className="absolute top-0 right-0 flex items-center gap-1 text-xs text-texto-secundario">
                <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
                Consultando a Receita...
              </span>
            )}
          </div>
          {duplicado && (
            <p className="rounded-lg border border-atencao/40 bg-atencao-fundo p-3 text-sm">
              Este documento já está cadastrado para {duplicado.nome}.{" "}
              <Link
                href={`/app/clientes/${duplicado.id}`}
                className="font-medium underline underline-offset-2"
              >
                Abrir o cadastro
              </Link>
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <CampoCliente
              form={form}
              nome="celular"
              rotulo="Celular com DDD"
              tipo="tel"
              modoEntrada="numeric"
              mascara={mascaraTelefoneEntrada}
              placeholder="(61) 99999-9999"
            />
            <CampoCliente form={form} nome="email" rotulo="E-mail" tipo="email" />
          </div>
          <button
            type="button"
            onClick={() => setAdicionaisAbertos((aberto) => !aberto)}
            aria-expanded={adicionaisAbertos}
            className="flex items-center gap-2 text-sm font-medium text-primaria"
          >
            <ChevronDown
              aria-hidden
              className={cn("size-4 transition-transform", adicionaisAbertos && "rotate-180")}
            />
            Dados adicionais
          </button>
          <div className={cn(!adicionaisAbertos && "hidden")}>
            <SecaoDadosAdicionais
              form={form}
              representantes={representantes}
              idAtual={clienteId}
              aoMudarCep={aoMudarCep}
            />
          </div>
          {erroGeral && (
            <p role="alert" className="text-sm text-erro">
              {erroGeral}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t px-5 py-3">
          {clienteId ? (
            <Button type="button" variant="ghost" onClick={aoFechar}>
              Cancelar
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={aoDescartar}>
              Descartar
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : clienteId ? "Salvar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
