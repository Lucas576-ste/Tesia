import Image from "next/image";

const TELAS = {
  envio: { largura: 1048, altura: 400, alt: "Tela de envio da intimação na Tesia" },
  analise: {
    largura: 1280,
    altura: 820,
    alt: "Tela de análise da intimação, com resumo, pontos atacáveis e prazo",
  },
  editor: {
    largura: 1280,
    altura: 820,
    alt: "Editor da peça com pendências [CONFIRMAR] destacadas",
  },
  painel: { largura: 1280, altura: 820, alt: "Painel de prazos com o que vence primeiro" },
} as const;

export function CapturaTela({
  tela,
  prioridade = false,
}: {
  tela: keyof typeof TELAS;
  prioridade?: boolean;
}) {
  const { largura, altura, alt } = TELAS[tela];
  return (
    <Image
      src={`/telas/${tela}-v2.webp`}
      width={largura}
      height={altura}
      alt={alt}
      priority={prioridade}
      sizes="(min-width: 768px) 480px, 100vw"
      className="h-auto w-full"
    />
  );
}
