"use client";

import { useActionState } from "react";
import { salvarNovaSenha } from "@/app/(autenticacao)/acoes";
import { CampoFormulario } from "@/components/publico/campo-formulario";
import { BotaoEnviar } from "./botao-enviar";
import { MensagemFormulario } from "./mensagem-formulario";

export function FormularioNovaSenha() {
  const [estado, acao, pendente] = useActionState(salvarNovaSenha, {});

  return (
    <form action={acao} className="flex flex-col gap-3">
      <CampoFormulario
        id="senha"
        rotulo="Nova senha (mínimo de 8 caracteres)"
        type="password"
        minLength={8}
        autoComplete="new-password"
      />
      <MensagemFormulario estado={estado} />
      <BotaoEnviar pendente={pendente}>Salvar nova senha</BotaoEnviar>
    </form>
  );
}
