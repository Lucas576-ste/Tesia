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
      "Dados de cadastro, como nome, e-mail e OAB, para criar e manter a conta. Intimações, processos e peças enviados pelo advogado, para gerar análises, prazos e rascunhos.",
      "Dados de interessados no programa Cliente Fundador, como nome, e-mail, OAB, UF, área e WhatsApp, além da origem da visita, para entrar em contato sobre o programa.",
      "Base legal de cada tratamento: [a definir na revisão].",
    ],
  },
  {
    titulo: "Suboperadores",
    paragrafos: [
      "Supabase (banco de dados, autenticação e arquivos), Vercel (hospedagem), Anthropic (IA), provedor de embeddings [a definir], Resend (e-mails) e Sentry (monitoramento de erros). O provedor de pagamentos será incluído quando a cobrança entrar em operação.",
    ],
  },
  {
    titulo: "Transferência internacional",
    paragrafos: [
      "Os dados ficam armazenados no Brasil, na região de São Paulo. O processamento pela IA ocorre fora do Brasil, o que caracteriza transferência internacional de dados. Só é enviado o necessário para cada etapa.",
    ],
  },
  {
    titulo: "Retenção e exclusão",
    paragrafos: [
      "O advogado pode excluir peças, intimações e processos. Depois do cancelamento, os dados ficam disponíveis para exportação por 90 dias e então são apagados. Os backups expiram conforme a política do provedor.",
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
