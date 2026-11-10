"use client";

import Link from "next/link";
import { useActionState } from "react";
import { cadastrar } from "@/app/(autenticacao)/acoes";
import { CampoFormulario } from "@/components/publico/campo-formulario";
import { BotaoEnviar } from "./botao-enviar";
import { MensagemFormulario } from "./mensagem-formulario";

export function FormularioCadastro() {
  const [estado, acao, pendente] = useActionState(cadastrar, {});

  if (estado.sucesso) return <MensagemFormulario estado={estado} />;

  return (
    <form action={acao} className="flex flex-col gap-3">
      <CampoFormulario id="nome" rotulo="Nome" autoComplete="name" />
      <CampoFormulario
        id="email"
        rotulo="E-mail"
        type="email"
        autoComplete="email"
        defaultValue={estado.email}
      />
      <CampoFormulario
        id="senha"
        rotulo="Senha (mínimo de 8 caracteres)"
        type="password"
        minLength={8}
        autoComplete="new-password"
      />
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="aceite" required className="mt-0.5 accent-primaria" />
        <span>
          Li e aceito os{" "}
          <Link href="/termos" target="_blank" className="text-primaria underline">
            termos de uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" target="_blank" className="text-primaria underline">
            política de privacidade
          </Link>
          .
        </span>
      </label>
      <MensagemFormulario estado={estado} />
      <BotaoEnviar pendente={pendente}>Criar conta</BotaoEnviar>
    </form>
  );
}
