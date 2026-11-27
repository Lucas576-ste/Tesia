import type { ReactNode } from "react";
import { AcordeaoPerguntas } from "./acordeao-perguntas";
import { Confirmar, mostrarConfirmar } from "./confirmar";
import { SecaoLanding } from "./secao-landing";

const perguntas: { pergunta: string; resposta: ReactNode; aConfirmar?: boolean }[] = [
  {
    pergunta: "O que é a Tesia?",
    resposta:
      "Um sistema para advogados que lê a intimação que você envia, resume o que aconteceu, calcula o prazo mostrando a conta e escreve o rascunho da peça no seu estilo. Você revisa, baixa em .docx com o seu timbrado e protocola.",
  },
  {
    pergunta: "Para quem é?",
    resposta:
      "Para advogados que trabalham sozinhos ou em dupla e querem gastar menos tempo com prazo e rascunho. Hoje, há calendários do TRF1 e do TRT10 no DF; para o TJDFT e outros tribunais, a Tesia avisa para você conferir feriados e suspensões.",
  },
  {
    pergunta: "Como funciona o teste grátis?",
    resposta:
      "Você cria a conta e usa por 11 dias com tudo do plano Individual, até 7 peças por dia. Não pedimos cartão e não há cobrança automática no fim: se quiser continuar, escolhe um plano.",
  },
  {
    pergunta: "Como funciona a assinatura?",
    resposta:
      "É mensal ou anual (com 2 meses grátis), sem taxa de ativação e sem fidelidade. Cada plano tem um limite de peças por mês; análises de intimação e prazos não têm limite. Você pode trocar de plano ou cancelar quando quiser.",
  },
  {
    pergunta: "Quem é a Lia?",
    resposta:
      "A Lia é a assistente de inteligência artificial da Tesia. Ela lê suas intimações, explica o prazo, escreve os rascunhos e avisa antes do vencimento. Ela não é uma pessoa e não decide por você.",
  },
  {
    pergunta: "Posso confiar nas citações?",
    resposta:
      "A Lia é instruída a usar apenas os fatos dos documentos do processo e as referências que você já usa nas suas peças. Mesmo assim, toda citação aparece marcada para você conferir na fonte oficial antes de protocolar.",
  },
  {
    pergunta: "Quem tem a palavra final?",
    resposta:
      "Você. A Lia entrega rascunhos e sugestões de prazo, e a responsabilidade pela peça e pelo prazo é do advogado. Nenhum prazo entra no painel sem a sua confirmação e nada é protocolado sem você.",
  },
  {
    pergunta: "Como sei que o prazo está certo?",
    resposta: (
      <>
        O cálculo é feito por regras fixas, não pela IA, e você vê a conta inteira antes de
        confirmar: publicação, início, dias úteis, feriados e vencimento. Se o seu tribunal tiver um
        feriado ou suspensão que não está na lista, você cadastra em Configurações e os próximos
        cálculos já contam essa data.
      </>
    ),
  },
  {
    pergunta: "A OAB permite usar IA na advocacia?",
    aConfirmar: true,
    resposta: (
      <Confirmar motivo="citar o documento oficial da OAB">
        O Conselho Federal da OAB publicou recomendações para o uso de IA na advocacia, com foco em
        supervisão humana, sigilo e proteção de dados. A Tesia segue essa linha: você revisa tudo, e
        os dados ficam restritos ao seu escritório.
      </Confirmar>
    ),
  },
  {
    pergunta: "Vai escrever igual a mim mesmo?",
    resposta:
      "Quanto mais peças suas a Lia conhece, mais o rascunho se parece com o seu. Com 5 a 10 peças, ela já aprende a sua estrutura, o seu tom e as suas citações preferidas. Cada peça que você revisa no sistema também ajuda.",
  },
  {
    pergunta: "Como as intimações chegam até a Lia?",
    resposta:
      "Você envia o PDF e ela cuida do resto. Os avisos valem para os prazos que você enviou e confirmou. A busca automática pela sua OAB está em desenvolvimento.",
  },
  {
    pergunta: "Atende fora do DF?",
    resposta:
      "Por enquanto, as vagas de fundador são para advogados do DF. Há calendários do TRF1 e do TRT10 no DF; para o TJDFT e outros tribunais, a Tesia avisa para você conferir feriados e suspensões. Se você atua em outro estado, entre na lista de espera e avisamos quando chegarmos até você.",
  },
  {
    pergunta: "Onde ficam os meus dados?",
    resposta: (
      <>
        Arquivos e banco de dados ficam no Brasil, com criptografia. Para gerar a análise e o
        rascunho, o texto é processado pelo provedor de IA, fora do Brasil.{" "}
        <Confirmar motivo="termos de retenção e não uso para treino">
          Termos do provedor a conferir.
        </Confirmar>
      </>
    ),
  },
  {
    pergunta: "Tenho um sócio. Como funciona?",
    resposta:
      "O plano Sociedade está chegando. Nele, dois advogados dividem a mesma conta: cada um com o seu estilo, cada prazo com um responsável e 100 peças por mês para os dois. As vagas de fundador valem para 1 advogado cada. Se tiver interesse, entre na lista de espera.",
  },
  {
    pergunta: "Tem taxa de ativação?",
    resposta: "Não. Você paga só a mensalidade.",
  },
  {
    pergunta: "Posso cancelar e levar meus dados?",
    resposta: "Sim. Você cancela quando quiser e pode exportar todas as peças e prazos.",
  },
];

export function Perguntas() {
  const visiveis = perguntas
    .filter(({ aConfirmar }) => mostrarConfirmar || !aConfirmar)
    .map(({ pergunta, resposta }) => ({ pergunta, resposta }));

  return (
    <SecaoLanding id="perguntas" titulo="Perguntas frequentes">
      <AcordeaoPerguntas perguntas={visiveis} />
    </SecaoLanding>
  );
}
