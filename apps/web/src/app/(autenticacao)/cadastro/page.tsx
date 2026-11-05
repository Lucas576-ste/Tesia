import type { Metadata } from "next";
import Link from "next/link";
import { BotaoGoogle } from "@/components/publico/botao-google";
import { CampoFormulario } from "@/components/publico/campo-formulario";
import { FormularioDemonstracao } from "@/components/publico/formulario-demonstracao";
import { TituloAutenticacao } from "@/components/publico/titulo-autenticacao";

export const metadata: Metadata = { title: "Criar conta · Tesia" };

export default function CadastroPage() {
  return (
    <>
      <TituloAutenticacao
        titulo="Criar conta"
        descricao="Programa fundador: 15 dias grátis, sem cartão de crédito."
      />
      <BotaoGoogle />
      <FormularioDemonstracao textoBotao="Criar conta">
        <CampoFormulario id="nome" rotulo="Nome" autoComplete="off" />
        <CampoFormulario id="email" rotulo="E-mail" type="email" autoComplete="off" />
        <CampoFormulario
          id="senha"
          rotulo="Senha (mínimo de 8 caracteres)"
          type="password"
          minLength={8}
          autoComplete="off"
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
      </FormularioDemonstracao>
      <Link href="/login" className="py-1.5 text-sm text-primaria hover:underline">
        Já tenho conta
      </Link>
    </>
  );
}
