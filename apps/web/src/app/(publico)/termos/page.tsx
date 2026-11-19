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
    titulo: "Alertas por e-mail",
    paragrafos: [
      "A Tesia envia um resumo diário por e-mail com os prazos confirmados nos momentos escolhidos pelo advogado em Configurações. O envio depende de provedores externos e pode atrasar ou falhar; por isso o alerta é um apoio, não uma garantia.",
    ],
  },
  {
    titulo: "Planos e limites",
    paragrafos: [
      "Plano Start: 10 peças por mês. Plano Pro: 50 peças por mês. Plano Sociedade: 100 peças por mês, compartilhadas. Teste grátis: 7 dias, até 5 peças. Os valores e condições vigentes são os exibidos na contratação.",
      "Ao chegar em 80% das peças do mês, o sistema avisa; em 100%, novos rascunhos ficam bloqueados até o mês seguinte, a compra de um pacote extra ou a troca de plano. Análise de intimações, prazos e alertas continuam funcionando.",
      "Para proteger o serviço, há limites de tentativas por período (por exemplo, no login e na geração de peças).",
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
