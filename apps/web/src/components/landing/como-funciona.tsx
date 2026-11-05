import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Confirmar } from "./confirmar";
import { MiniAnalise, MiniPainel, MiniRascunho, MiniUpload } from "./mini-telas";
import { MolduraNavegador } from "./moldura-navegador";
import { SecaoLanding } from "./secao-landing";

const passos: {
  titulo: ReactNode;
  chave: string;
  texto: string;
  legenda: string;
  tela: ReactNode;
}[] = [
  {
    chave: "envie",
    titulo: "Envie a intimação",
    texto: "Mande o PDF da intimação ou da decisão. Uma ou várias de uma vez.",
    legenda: "Exemplo ilustrativo: tela de envio da intimação",
    tela: <MiniUpload />,
  },
  {
    chave: "entenda",
    titulo: (
      <Confirmar motivo="tempo médio real da análise" alternativa="Entenda o que aconteceu">
        Entenda em 30 segundos
      </Confirmar>
    ),
    texto:
      "A Lia entrega o resumo do que aconteceu, os pontos que podem ser atacados e o prazo calculado com a conta passo a passo: publicação, início da contagem, dias úteis, feriados e vencimento. Você confere e confirma.",
    legenda: "Exemplo ilustrativo: tela de análise da intimação",
    tela: <MiniAnalise />,
  },
  {
    chave: "revise",
    titulo: "Revise o rascunho no seu estilo",
    texto:
      "A Lia escreve a peça com a sua estrutura, o seu jeito de argumentar e os fatos do processo. O que precisa da sua atenção aparece destacado para conferir. Baixe em .docx, já no seu papel timbrado.",
    legenda: "Exemplo ilustrativo: editor com pendências destacadas",
    tela: <MiniRascunho />,
  },
  {
    chave: "controle",
    titulo: "Tudo sob controle",
    texto: "Todos os prazos confirmados num painel, e a Lia avisa por e-mail antes do vencimento.",
    legenda: "Exemplo ilustrativo: painel de prazos",
    tela: <MiniPainel />,
  },
];

export function ComoFunciona() {
  return (
    <SecaoLanding
      id="como-funciona"
      titulo="Agora, você envia a intimação e a Lia faz o trabalho pesado."
    >
      <ol className="flex flex-col gap-10">
        {passos.map(({ chave, titulo, texto, legenda, tela }, indice) => (
          <li key={chave} className="grid items-center gap-5 md:grid-cols-2 md:gap-10">
            <div className={cn("flex flex-col gap-2", indice % 2 === 1 && "md:order-2")}>
              <span className="text-sm font-semibold text-primaria tabular-nums">
                Passo {indice + 1}
              </span>
              <h3 className="text-2xl font-semibold">{titulo}</h3>
              <p className="text-texto-secundario">{texto}</p>
            </div>
            <MolduraNavegador legenda={legenda}>{tela}</MolduraNavegador>
          </li>
        ))}
      </ol>
    </SecaoLanding>
  );
}
