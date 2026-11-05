import type { Metadata } from "next";
import Link from "next/link";
import { CampoFormulario } from "@/components/publico/campo-formulario";
import { FormularioDemonstracao } from "@/components/publico/formulario-demonstracao";
import { TituloAutenticacao } from "@/components/publico/titulo-autenticacao";

export const metadata: Metadata = { title: "Nova senha · Tesia" };

export default function NovaSenhaPage() {
  return (
    <>
      <TituloAutenticacao titulo="Criar nova senha" />
      <FormularioDemonstracao textoBotao="Salvar nova senha">
        <CampoFormulario
          id="senha"
          rotulo="Nova senha (mínimo de 8 caracteres)"
          type="password"
          minLength={8}
          autoComplete="off"
        />
      </FormularioDemonstracao>
      <Link href="/login" className="py-1.5 text-sm text-primaria hover:underline">
        Voltar para entrar
      </Link>
    </>
  );
}
