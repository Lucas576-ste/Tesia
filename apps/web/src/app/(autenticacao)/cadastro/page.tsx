import type { Metadata } from "next";
import Link from "next/link";
import { FormularioCadastro } from "@/components/autenticacao/formulario-cadastro";
import { BotaoGoogle } from "@/components/publico/botao-google";
import { TituloAutenticacao } from "@/components/publico/titulo-autenticacao";

export const metadata: Metadata = { title: "Criar conta · Tesia" };

export default function CadastroPage() {
  return (
    <>
      <TituloAutenticacao
        titulo="Criar conta"
        descricao="7 dias grátis com os recursos do Pro, sem cartão de crédito."
      />
      <BotaoGoogle />
      <FormularioCadastro />
      <Link href="/login" className="py-1.5 text-sm text-primaria hover:underline">
        Já tenho conta
      </Link>
    </>
  );
}
