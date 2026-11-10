import type { Metadata } from "next";
import Link from "next/link";
import { FormularioNovaSenha } from "@/components/autenticacao/formulario-nova-senha";
import { TituloAutenticacao } from "@/components/publico/titulo-autenticacao";

export const metadata: Metadata = { title: "Nova senha · Tesia" };

export default function NovaSenhaPage() {
  return (
    <>
      <TituloAutenticacao titulo="Criar nova senha" />
      <FormularioNovaSenha />
      <Link href="/login" className="py-1.5 text-sm text-primaria hover:underline">
        Voltar para entrar
      </Link>
    </>
  );
}
