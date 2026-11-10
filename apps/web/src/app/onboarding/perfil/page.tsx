import type { Metadata } from "next";
import { salvarPerfil } from "@/app/onboarding/acoes";
import { CabecalhoPasso } from "@/components/onboarding/cabecalho-passo";
import { FormularioPerfil } from "@/components/onboarding/formulario-perfil";
import { UFS } from "@/lib/lead";
import { areasPorCodigo } from "@/lib/onboarding";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Seus dados · Tesia" };

export default async function PerfilPage() {
  const usuario = await exigirUsuario();
  const uf = UFS.find((opcao) => opcao === usuario.oab_uf);
  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <>
      <CabecalhoPasso
        titulo="Seus dados profissionais"
        fala={`Olá, ${primeiroNome}! Eu sou a Lia, sua assistente de IA. Conte um pouco sobre a sua atuação.`}
      />
      <FormularioPerfil
        salvar={salvarPerfil}
        valoresIniciais={{
          oab: usuario.oab_numero ?? "",
          uf,
          areas: areasPorCodigo(usuario.areas),
          whatsapp: usuario.whatsapp ?? "",
        }}
      />
    </>
  );
}
