import type { Metadata } from "next";
import Link from "next/link";
import { CampoFormulario } from "@/components/publico/campo-formulario";
import { FormularioDemonstracao } from "@/components/publico/formulario-demonstracao";
import { TituloAutenticacao } from "@/components/publico/titulo-autenticacao";

export const metadata: Metadata = { title: "Recuperar senha · Tesia" };

export default function RecuperarSenhaPage() {
  return (
    <>
      <TituloAutenticacao
        titulo="Recuperar senha"
        descricao="Enviaremos um link por e-mail para você criar uma nova senha."
      />
      <FormularioDemonstracao
        textoBotao="Enviar link"
        depoisDeEnviar={
          <Link href="/recuperar-senha/nova" className="py-1.5 text-primaria hover:underline">
            Ver a tela de nova senha
          </Link>
        }
      >
        <CampoFormulario id="email" rotulo="E-mail" type="email" autoComplete="off" />
      </FormularioDemonstracao>
      <Link href="/login" className="py-1.5 text-sm text-primaria hover:underline">
        Voltar para entrar
      </Link>
    </>
  );
}
