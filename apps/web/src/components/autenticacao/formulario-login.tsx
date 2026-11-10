"use client";

import { useActionState } from "react";
import { entrar } from "@/app/(autenticacao)/acoes";
import { CampoFormulario } from "@/components/publico/campo-formulario";
import type { EstadoFormulario } from "@/lib/autenticacao";
import { BotaoEnviar } from "./botao-enviar";
import { MensagemFormulario } from "./mensagem-formulario";

type FormularioLoginProps = {
  proximo?: string;
  estadoInicial?: EstadoFormulario;
};

export function FormularioLogin({ proximo, estadoInicial = {} }: FormularioLoginProps) {
  const [estado, acao, pendente] = useActionState(entrar, estadoInicial);

  return (
    <form action={acao} className="flex flex-col gap-3">
      {proximo && <input type="hidden" name="proximo" value={proximo} />}
      <CampoFormulario
        id="email"
        rotulo="E-mail"
        type="email"
        autoComplete="email"
        defaultValue={estado.email}
      />
      <CampoFormulario id="senha" rotulo="Senha" type="password" autoComplete="current-password" />
      <MensagemFormulario estado={estado} />
      <BotaoEnviar pendente={pendente}>Entrar</BotaoEnviar>
    </form>
  );
}
