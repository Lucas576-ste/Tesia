import { AnimacaoFluxo } from "./animacao-fluxo";
import { BotaoRastreado } from "./botao-rastreado";
import { ExemploPrazo } from "./exemplo-prazo";
import { MiniAnalise } from "./mini-telas";
import { MolduraNavegador } from "./moldura-navegador";

export function Heroi() {
  return (
    <section className="bg-fundo">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div className="flex flex-col gap-5">
          <h1 className="text-4xl font-semibold text-titulo md:text-5xl">
            Da intimação à peça, no seu estilo.
          </h1>
          <p className="text-lg text-texto-secundario">
            Conheça a Lia, sua assistente de IA. Envie a intimação: ela resume o que aconteceu,
            calcula o prazo mostrando a conta e escreve um rascunho com a sua estrutura, o seu tom e
            as suas teses. Você revisa, confirma e protocola.
          </p>
          <div className="flex flex-wrap gap-2">
            <BotaoRastreado
              href="#fundador"
              evento="cta_hero_click"
              size="lg"
              className="w-full sm:w-auto"
            >
              Quero ser cliente fundador
            </BotaoRastreado>
            <BotaoRastreado
              href="#como-funciona"
              evento="ver_como_funciona"
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Ver como funciona
            </BotaoRastreado>
          </div>
          <p className="text-sm text-texto-secundario">
            6 vagas com 15 dias grátis. Sem cartão de crédito.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:gap-0">
          <div className="flex justify-center pb-3">
            <AnimacaoFluxo />
          </div>
          <MolduraNavegador legenda="Exemplo ilustrativo">
            <MiniAnalise comConta={false} />
          </MolduraNavegador>
          <div className="relative md:mt-3 md:ml-auto md:w-full lg:-mt-6 lg:w-72">
            <ExemploPrazo />
          </div>
        </div>
      </div>
    </section>
  );
}
