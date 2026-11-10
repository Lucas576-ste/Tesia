import type { Metadata } from "next";
import Link from "next/link";
import { FormularioLogin } from "@/components/autenticacao/formulario-login";
import { BotaoGoogle } from "@/components/publico/botao-google";
import { TituloAutenticacao } from "@/components/publico/titulo-autenticacao";
import { destinoSeguro } from "@/lib/autenticacao";

export const metadata: Metadata = { title: "Entrar · Tesia" };

const AVISOS: Record<string, string | undefined> = {
  link: "O link expirou ou já foi usado. Entre ou peça um novo.",
  sessao: "Sua sessão terminou. Entre de novo.",
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { proximo, erro } = await searchParams;
  const destino = typeof proximo === "string" ? destinoSeguro(proximo) : undefined;
  const estadoInicial = erro && typeof erro === "string" ? { erro: AVISOS[erro] } : {};

  return (
    <>
      <TituloAutenticacao titulo="Entrar" />
      <BotaoGoogle />
      <FormularioLogin proximo={destino} estadoInicial={estadoInicial} />
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
