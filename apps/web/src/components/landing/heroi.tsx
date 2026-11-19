import { Check } from "lucide-react";
import { PainelEscuro } from "@/components/mockups/painel-escuro";
import { BotaoRastreado } from "./botao-rastreado";
import { CTA_TESTE } from "./cta";
import { ExemploPrazo } from "./exemplo-prazo";
import { FundoCalendario } from "./fundo-calendario";
import { MolduraNavegador } from "./moldura-navegador";

const checks = ["Sem cartão de crédito", "Sem taxa de ativação", "Cancele quando quiser"];

export function Heroi() {
  return (
    <section className="relative overflow-hidden bg-fundo">
      <FundoCalendario />
      <div className="relative mx-auto grid max-w-6xl items-stretch gap-10 px-4 py-12 md:grid-cols-[1.1fr_1fr] md:py-20">
        <div className="flex min-w-0 flex-col gap-5">
          <span className="w-fit rounded-full bg-primaria-fundo px-3 py-1 text-sm font-semibold text-primaria">
            Com IA · 11 dias grátis
          </span>
          <h1 className="max-w-[16ch] text-[clamp(2.25rem,3.4vw,3.25rem)] leading-[1.1] font-bold text-titulo">
            Intimações, prazos, peças e clientes. Tudo num só lugar.
          </h1>
          <p className="text-lg text-texto-secundario">
            A Lia, sua assistente, lê suas intimações, calcula o prazo mostrando a conta e escreve a
            peça no seu estilo. Seus clientes e processos ficam organizados do início ao fim. Você
            revisa, confirma e protocola.
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
          <ul className="flex flex-wrap gap-x-3 gap-y-1 font-medium text-base lg:flex-nowrap lg:text-[0.9375rem]">
            {checks.map((item) => (
              <li key={item} className="flex items-center gap-1.5 whitespace-nowrap">
                <Check aria-hidden className="size-4 text-sucesso" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative flex min-w-0 flex-col gap-4 md:block">
          <MolduraNavegador legenda="Exemplo com dados fictícios">
            <PainelEscuro />
          </MolduraNavegador>
          <div className="md:absolute md:bottom-12 md:left-0 md:w-[60%] md:max-w-[17rem]">
            <ExemploPrazo compacto />
          </div>
        </div>
      </div>
    </section>
  );
}
