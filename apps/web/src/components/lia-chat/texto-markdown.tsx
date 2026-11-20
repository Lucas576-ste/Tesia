import Link from "next/link";
import { Fragment } from "react";
import { parsearMarkdown, type Trecho } from "@/lib/lia/markdown";

function Trechos({ trechos, aoNavegar }: { trechos: Trecho[]; aoNavegar: () => void }) {
  return (
    <>
      {trechos.map((trecho, indice) => (
        <Fragment key={indice}>
          {trecho.tipo === "negrito" ? (
            <strong className="font-semibold">{trecho.valor}</strong>
          ) : trecho.tipo === "link" ? (
            <Link
              href={trecho.href}
              onClick={aoNavegar}
              className="font-medium text-primaria underline underline-offset-2"
            >
              {trecho.texto}
            </Link>
          ) : (
            trecho.valor
          )}
        </Fragment>
      ))}
    </>
  );
}

export function TextoMarkdown({ texto, aoNavegar }: { texto: string; aoNavegar: () => void }) {
  return (
    <div className="flex flex-col gap-2 text-[15px] leading-relaxed">
      {parsearMarkdown(texto).map((bloco, indice) =>
        bloco.tipo === "paragrafo" ? (
          <p key={indice}>
            <Trechos trechos={bloco.trechos} aoNavegar={aoNavegar} />
          </p>
        ) : (
          <ListaMarkdown key={indice} ordenada={bloco.ordenada}>
            {bloco.itens.map((item, posicao) => (
              <li key={posicao}>
                <Trechos trechos={item} aoNavegar={aoNavegar} />
              </li>
            ))}
          </ListaMarkdown>
        ),
      )}
    </div>
  );
}

function ListaMarkdown({ ordenada, children }: { ordenada: boolean; children: React.ReactNode }) {
  const Etiqueta = ordenada ? "ol" : "ul";
  return (
    <Etiqueta className={`flex flex-col gap-1 pl-5 ${ordenada ? "list-decimal" : "list-disc"}`}>
      {children}
    </Etiqueta>
  );
}
