import type { Metadata } from "next";
import { CabecalhoPasso } from "@/components/onboarding/cabecalho-passo";
import { FormularioPerfil } from "@/components/onboarding/formulario-perfil";

export const metadata: Metadata = { title: "Seus dados · Tesia" };

export default function PerfilPage() {
  return (
    <>
      <CabecalhoPasso
        titulo="Seus dados profissionais"
        fala="Olá, eu sou a Lia, sua assistente de IA. Conte um pouco sobre a sua atuação."
      />
      <FormularioPerfil />
    </>
  );
}
