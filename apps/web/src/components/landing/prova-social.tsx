import { numeros, visiveis } from "@/content/proof";
import { SeloExemplo } from "./selo-exemplo";
import { NumeroAnimado } from "./numero-animado";

export function ProvaSocial() {
  const itens = visiveis(numeros);
  if (itens.length === 0) return null;

  return (
    <section aria-label="A Tesia em números" className="border-y bg-secao">
      <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
        {itens.map(({ valor, rotulo, isExample }) => (
          <div key={rotulo} className="flex flex-col gap-1">
            <dt className="order-2 text-sm text-texto-secundario">{rotulo}</dt>
            <dd className="order-1 flex items-center gap-2 text-3xl font-extrabold text-primaria tabular-nums md:text-4xl">
              <NumeroAnimado valor={valor} />
              <SeloExemplo ativo={isExample} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
