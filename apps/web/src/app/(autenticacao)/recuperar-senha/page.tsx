import type { Metadata } from "next";
import Link from "next/link";
import { FormularioRecuperacao } from "@/components/autenticacao/formulario-recuperacao";
import { TituloAutenticacao } from "@/components/publico/titulo-autenticacao";

export const metadata: Metadata = { title: "Recuperar senha · Tesia" };

export default function RecuperarSenhaPage() {
  return (
    <>
      <TituloAutenticacao
        titulo="Recuperar senha"
        descricao="Enviaremos um link por e-mail para você criar uma nova senha."
      />
      <FormularioRecuperacao />
      <Link href="/login" className="py-1.5 text-sm text-primaria hover:underline">
        Voltar para entrar
      </Link>
    </>
  );
}
