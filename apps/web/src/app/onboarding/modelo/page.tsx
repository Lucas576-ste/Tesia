import type { Metadata } from "next";
import { CabecalhoPasso } from "@/components/onboarding/cabecalho-passo";
import { EscolhaModelo } from "@/components/onboarding/escolha-modelo";
import { exigirUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Seu modelo · Tesia" };

export default async function ModeloPage() {
  const usuario = await exigirUsuario();

  return (
    <>
      <CabecalhoPasso
        titulo="Seu modelo de documento"
        fala="Última etapa: escolha como as peças vão sair quando você baixar o .docx."
      />
      <EscolhaModelo
        modelo={{
          escritorioId: usuario.escritorio_id,
          usuarioId: usuario.id,
          temModelo: Boolean(usuario.modelo_docx_path),
        }}
      />
    </>
  );
}
