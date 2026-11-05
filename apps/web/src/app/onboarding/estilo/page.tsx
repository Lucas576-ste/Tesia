import type { Metadata } from "next";
import { CabecalhoPasso } from "@/components/onboarding/cabecalho-passo";
import { EnvioPecas } from "@/components/onboarding/envio-pecas";

export const metadata: Metadata = { title: "Seu estilo · Tesia" };

export default function EstiloPage() {
  return (
    <>
      <CabecalhoPasso
        titulo="Me ensine o seu estilo"
        fala="Quanto mais peças suas eu conhecer, mais o rascunho vai parecer com o que você escreve."
      />
      <EnvioPecas />
    </>
  );
}
