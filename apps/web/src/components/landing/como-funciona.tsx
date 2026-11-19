import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { AnaliseIntimacao } from "@/components/mockups/analise-intimacao";
import { CaixaIntimacoes } from "@/components/mockups/caixa-intimacoes";
import { ClienteProcesso } from "@/components/mockups/cliente-processo";
import { EditorPeca } from "@/components/mockups/editor-peca";
import { cn } from "@/lib/utils";
import { LinhaPassos } from "./linha-passos";
import { MolduraNavegador } from "./moldura-navegador";
import { SecaoLanding } from "./secao-landing";

const passos: {
  chave: string;
  titulo: string;
  texto: string;
  destaques: string[];
  tela: ReactNode;
}[] = [
  {
    chave: "chegam",
    titulo: "Suas intimações chegam sozinhas",
    texto:
      "Todo dia a Tesia busca no DJEN as publicações da sua OAB. Recebeu um PDF por outro caminho? É só enviar.",
    destaques: [
      "Busca diária pela sua OAB",
      "Vários PDFs de uma vez",
      "Nada se perde no meio do e-mail",
    ],
    tela: <CaixaIntimacoes />,
  },
  {
    chave: "entenda",
    titulo: "Entenda o caso e o prazo em segundos",
    texto:
      "A Lia resume o que aconteceu em linguagem simples, aponta o que pode ser atacado e mostra a conta do prazo inteira.",
    destaques: [
      "Conta do prazo passo a passo, com dias úteis e feriados",
      "Pontos atacáveis e a peça cabível sugerida",
      "Nada vale sem a sua confirmação",
    ],
    tela: <AnaliseIntimacao />,
  },
  {
    chave: "peca",
    titulo: "A peça pronta, escrita do seu jeito",
    texto:
      "A Lia aprende com as suas peças antigas e escreve com a sua estrutura e o seu jeito de argumentar.",
    destaques: [
      "Estilo aprendido das suas próprias peças",
      "[CONFIRMAR] onde precisa da sua atenção",
      ".docx no seu papel timbrado, pronto para protocolar",
    ],
    tela: <EditorPeca />,
  },
  {
    chave: "controle",
    titulo: "Cada cliente, cada processo, sob controle",
    texto:
      "Os prazos ficam num painel por urgência, e cada processo do cliente mostra em que fase está.",
    destaques: [
      "Fases do processo atualizadas sozinhas",
      "Alertas antes do vencimento e agenda no celular",
      "Seu sócio vê o mesmo painel",
    ],
    tela: <ClienteProcesso />,
  },
];

export function ComoFunciona() {
  return (
    <SecaoLanding id="como-funciona" titulo="Da intimação à peça pronta, sem perder nenhum prazo.">
      <LinhaPassos>
        {passos.map(({ chave, titulo, texto, destaques, tela }, indice) => (
          <li key={chave} className="relative grid items-center gap-5 md:grid-cols-2 md:gap-16">
            <span
              aria-hidden
              className="absolute top-1 -left-[25px] size-3.5 rounded-full border-2 border-fundo bg-primary md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
            />
            <div className={cn("flex flex-col gap-3", indice % 2 === 1 && "md:order-2")}>
              <span className="text-sm font-semibold text-primaria tabular-nums">
                Passo {indice + 1}
              </span>
              <h3 className="text-2xl font-semibold">{titulo}</h3>
              <p className="text-texto-secundario">{texto}</p>
              <ul className="flex flex-col gap-1.5">
                {destaques.map((item) => (
                  <li key={item} className="flex gap-2 font-medium">
                    <Check aria-hidden className="mt-1 size-4 shrink-0 text-sucesso" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <MolduraNavegador legenda="Exemplo com dados fictícios">{tela}</MolduraNavegador>
          </li>
        ))}
      </LinhaPassos>
    </SecaoLanding>
  );
}
