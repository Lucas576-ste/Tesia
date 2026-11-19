import { Check, X } from "lucide-react";
import { SecaoLanding } from "./secao-landing";

const linhas = [
  { item: "Lê a intimação e entende o processo", tesia: true, generica: false },
  {
    item: "Calcula o prazo mostrando a conta, com feriados e o artigo de lei",
    tesia: true,
    generica: false,
  },
  { item: "Escreve no seu estilo, aprendido com as suas peças", tesia: true, generica: false },
  { item: "Marca o que você precisa conferir antes de assinar", tesia: true, generica: false },
  { item: "Guarda prazos, peças e versões num só lugar", tesia: true, generica: false },
  { item: "Entrega o .docx no seu papel timbrado", tesia: true, generica: false },
  { item: "Exige copiar e colar o processo a cada pergunta", tesia: false, generica: true },
];

function Marca({ sim }: { sim: boolean }) {
  return sim ? (
    <Check aria-label="Sim" className="mx-auto size-5 text-sucesso" />
  ) : (
    <X aria-label="Não" className="mx-auto size-5 text-texto-secundario" />
  );
}

export function ComparacaoIa() {
  return (
    <SecaoLanding fundo="branco" titulo="Não é mais uma IA genérica.">
      <p className="max-w-2xl text-texto-secundario">
        Uma IA de conversa responde ao que você cola nela. A Lia trabalha com os seus processos, os
        seus prazos e o seu jeito de escrever.
      </p>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-3 text-left font-semibold">
                O que você precisa
              </th>
              <th
                scope="col"
                className="w-28 bg-primaria-fundo p-3 text-center font-bold text-primaria"
              >
                Tesia
              </th>
              <th scope="col" className="w-28 p-3 text-center font-semibold text-texto-secundario">
                IA genérica
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ item, tesia, generica }) => (
              <tr key={item} className="border-b last:border-b-0">
                <th scope="row" className="p-3 text-left font-normal">
                  {item}
                </th>
                <td className="bg-primaria-fundo/60 p-3">
                  <Marca sim={tesia} />
                </td>
                <td className="p-3">
                  <Marca sim={generica} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SecaoLanding>
  );
}
