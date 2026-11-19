import { Check } from "lucide-react";
import { AnimacaoFluxo } from "./animacao-fluxo";
import { BotaoRastreado } from "./botao-rastreado";
import { ExemploPrazo } from "./exemplo-prazo";
import { CapturaTela } from "./captura-tela";
import { CTA_TESTE } from "./cta";
import { MolduraNavegador } from "./moldura-navegador";
import { FundoHero } from "./fundo-hero";

export function Heroi() {
  return (
    <section className="relative overflow-hidden bg-fundo">
      <FundoHero />
      <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div className="flex flex-col gap-5">
          <span className="w-fit rounded-full bg-primaria-fundo px-3 py-1 text-sm font-semibold text-primaria">
            11 dias grátis · sem cartão
          </span>
          <h1 className="text-4xl font-bold text-titulo md:text-5xl">
            Intimações, prazos, peças e clientes. Tudo num só lugar, com IA.
          </h1>
          <p className="text-lg text-texto-secundario">
            A Lia, sua assistente, encontra suas intimações, calcula o prazo mostrando a conta e
            escreve a peça no seu estilo. Seus clientes e processos ficam organizados do início ao
            fim. Você revisa, confirma e protocola.
          </p>
          <div className="flex flex-wrap gap-2">
            <BotaoRastreado
              href={CTA_TESTE.href}
              evento="cta_hero_click"
              size="lg"
              className="reflexo-dourado w-full sm:w-auto"
            >
              {CTA_TESTE.texto}
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
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-base font-medium">
            {["Sem cartão de crédito", "Sem taxa de ativação", "Cancele quando quiser"].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check aria-hidden className="size-4 text-sucesso" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="flex flex-col gap-3 md:gap-0">
          <div className="flex justify-center pb-3">
            <AnimacaoFluxo />
          </div>
          <MolduraNavegador legenda="Tela real, com dados fictícios">
            <CapturaTela tela="analise" prioridade />
          </MolduraNavegador>
          <div className="relative md:mt-3 md:ml-auto md:w-full lg:-mt-6 lg:w-72">
            <ExemploPrazo />
          </div>
        </div>
      </div>
    </section>
  );
}
