import type { Metadata } from "next";
import { DocumentoLegal } from "@/components/publico/documento-legal";

export const metadata: Metadata = { title: "Termos de uso · Tesia" };

const secoes = [
  {
    titulo: "O que o serviço faz",
    paragrafos: [
      "A Tesia lê intimações enviadas pelo advogado, resume o que aconteceu, calcula o prazo, sugere a peça cabível e gera um rascunho no estilo do advogado.",
      "No momento, a intimação entra apenas quando o advogado envia o arquivo. A Tesia não monitora diários nem sistemas de tribunais.",
    ],
  },
  {
    titulo: "Sugestões e responsabilidade do advogado",
    paragrafos: [
      "Prazos e peças são sugestões. Conferir o prazo, revisar a peça e protocolá-la são responsabilidade do advogado. O sistema nunca protocola.",
      "Os alertas dependem de o prazo ter sido enviado e confirmado, e não substituem o acompanhamento dos processos pelo advogado.",
    ],
  },
  {
    titulo: "Planos e limites",
    paragrafos: [
      "Plano Start: 10 peças por mês. Plano Pro: 50 peças por mês. Os valores e condições vigentes são os exibidos na contratação.",
    ],
  },
  {
    titulo: "Cancelamento",
    paragrafos: [
      "O advogado pode cancelar quando quiser. Depois do cancelamento, os dados ficam disponíveis para exportação por 90 dias e então são apagados, inclusive arquivos e embeddings.",
    ],
  },
  {
    titulo: "Uso proibido",
    paragrafos: [
      "Não é permitido usar o serviço para fins ilegais, enviar documentos sem ter autorização para tratá-los ou tentar acessar dados de outros escritórios.",
    ],
  },
  {
    titulo: "Responsável pelo serviço",
    paragrafos: ["Razão social, CNPJ, endereço e foro: [a definir]."],
  },
];

export default function TermosPage() {
  return <DocumentoLegal titulo="Termos de uso" secoes={secoes} />;
}
