import type { Metadata } from "next";
import { CabecalhoPasso } from "@/components/onboarding/cabecalho-passo";
import { EscolhaModelo } from "@/components/onboarding/escolha-modelo";

export const metadata: Metadata = { title: "Seu modelo · Tesia" };

export default function ModeloPage() {
  return (
    <>
      <CabecalhoPasso
        titulo="Seu modelo de documento"
        fala="Última etapa: escolha como as peças vão sair quando você baixar o .docx."
      />
      <EscolhaModelo />
    </>
  );
}
