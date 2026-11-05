import type { Metadata } from "next";
import Link from "next/link";
import { BotaoGoogle } from "@/components/publico/botao-google";
import { CampoFormulario } from "@/components/publico/campo-formulario";
import { FormularioDemonstracao } from "@/components/publico/formulario-demonstracao";
import { TituloAutenticacao } from "@/components/publico/titulo-autenticacao";

export const metadata: Metadata = { title: "Entrar · Tesia" };

export default function LoginPage() {
  return (
    <>
      <TituloAutenticacao titulo="Entrar" />
      <BotaoGoogle />
      <FormularioDemonstracao textoBotao="Entrar">
        <CampoFormulario id="email" rotulo="E-mail" type="email" autoComplete="off" />
        <CampoFormulario id="senha" rotulo="Senha" type="password" autoComplete="off" />
      </FormularioDemonstracao>
      <div className="flex flex-col gap-1 text-sm">
        <Link href="/recuperar-senha" className="py-1.5 text-primaria hover:underline">
          Esqueci minha senha
        </Link>
        <Link href="/cadastro" className="py-1.5 text-primaria hover:underline">
          Ainda não tenho conta
        </Link>
      </div>
    </>
  );
}
