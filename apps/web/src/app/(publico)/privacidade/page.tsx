import type { Metadata } from "next";
import { DocumentoLegal } from "@/components/publico/documento-legal";

export const metadata: Metadata = { title: "Política de privacidade · Tesia" };

const secoes = [
  {
    titulo: "Papéis na LGPD",
    paragrafos: [
      "O advogado ou escritório é o controlador dos dados dos seus clientes. A Tesia atua como operadora e trata esses dados em nome dele.",
    ],
  },
  {
    titulo: "Dados coletados e finalidade",
    paragrafos: [
      "Dados de cadastro, como nome, e-mail e OAB, para criar e manter a conta. Intimações, processos e peças enviados pelo advogado, para gerar análises, prazos e rascunhos. Peças antigas enviadas em Meu estilo, para aprender o estilo de escrita do advogado.",
      "E-mail e preferências de alerta, para enviar os avisos de prazo. Registros técnicos de erro, sem o conteúdo dos documentos, para corrigir falhas.",
      "Dados de interessados no programa Cliente Fundador, como nome, e-mail, OAB, UF, área e WhatsApp, além da origem da visita, para entrar em contato sobre o programa.",
      "Base legal de cada tratamento: [a definir na revisão].",
    ],
  },
  {
    titulo: "Suboperadores",
    paragrafos: [
      "Supabase (banco de dados, autenticação e arquivos, em São Paulo), Vercel (hospedagem do site), Railway (processamento em segundo plano), Anthropic (IA que lê intimações e escreve rascunhos), Voyage AI (embeddings para encontrar trechos das peças antigas do advogado), Resend (e-mails de alerta) e Sentry (monitoramento de erros, sem o conteúdo dos documentos). O provedor de pagamentos será incluído quando a cobrança entrar em operação.",
      "Uso dos dados pelos provedores de IA para treinar modelos: [CONFIRMAR com os termos comerciais vigentes da Anthropic e da Voyage AI].",
    ],
  },
  {
    titulo: "Transferência internacional",
    paragrafos: [
      "Os dados ficam armazenados no Brasil, na região de São Paulo. O processamento pela IA (Anthropic e Voyage AI), o envio de e-mails, o monitoramento de erros e parte da hospedagem ocorrem fora do Brasil, o que caracteriza transferência internacional de dados. Só é enviado o necessário para cada etapa.",
    ],
  },
  {
    titulo: "Retenção e exclusão",
    paragrafos: [
      "O advogado pode excluir peças, intimações e processos. Depois do cancelamento, os dados ficam disponíveis para exportação por 90 dias e então são apagados. Cópias de segurança diárias e criptografadas do banco são mantidas por 30 dias e então descartadas.",
    ],
  },
  {
    titulo: "Segurança",
    paragrafos: [
      "Cada escritório só acessa os próprios dados, com isolamento no banco. Arquivos ficam em armazenamento privado, e o download exige login. Há limite de tentativas no login e registro de erros sem conteúdo dos documentos.",
    ],
  },
  {
    titulo: "Direitos do titular e contato",
    paragrafos: [
      "O titular pode solicitar acesso, correção e exclusão dos seus dados, nos termos da LGPD. Encarregado e canal de contato: [a definir].",
    ],
  },
];

export default function PrivacidadePage() {
  return <DocumentoLegal titulo="Política de privacidade" secoes={secoes} />;
}
