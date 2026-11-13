import type { Metadata } from "next";
import { CabecalhoPasso } from "@/components/onboarding/cabecalho-passo";
import { EnvioPecas } from "@/components/onboarding/envio-pecas";
import { buscarPerfilEstilo, listarPecasEstilo } from "@/lib/estilo-servidor";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Seu estilo · Tesia" };

export default async function EstiloPage() {
  const usuario = await exigirUsuario();
  const [pecas, perfil] = await Promise.all([
    listarPecasEstilo(usuario.id),
    buscarPerfilEstilo(usuario.id),
  ]);

  return (
    <>
      <CabecalhoPasso
        titulo="Me ensine o seu estilo"
        fala="Quanto mais peças suas eu conhecer, mais o rascunho vai parecer com o que você escreve."
      />
      <EnvioPecas
        escritorioId={usuario.escritorio_id}
        usuarioId={usuario.id}
        pecasIniciais={pecas}
        perfil={perfil}
      />
    </>
  );
}
