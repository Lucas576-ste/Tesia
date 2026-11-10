"use client";

import { useActionState } from "react";
import { enviarRecuperacao } from "@/app/(autenticacao)/acoes";
import { CampoFormulario } from "@/components/publico/campo-formulario";
import { BotaoEnviar } from "./botao-enviar";
import { MensagemFormulario } from "./mensagem-formulario";

export function FormularioRecuperacao() {
  const [estado, acao, pendente] = useActionState(enviarRecuperacao, {});

  return (
    <form action={acao} className="flex flex-col gap-3">
      <CampoFormulario
        id="email"
        rotulo="E-mail"
        type="email"
        autoComplete="email"
        defaultValue={estado.email}
      />
      <MensagemFormulario estado={estado} />
      <BotaoEnviar pendente={pendente}>Enviar link</BotaoEnviar>
    </form>
  );
}
