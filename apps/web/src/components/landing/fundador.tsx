import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormularioFundador } from "./formulario-fundador";
import { SecaoLanding } from "./secao-landing";

const incluido = [
  "15 dias grátis, com até 15 peças e sem cartão",
  "R$ 79/mês depois do período grátis, com 50 peças por mês (preço normal do Pro: R$ 129)",
  "Configuração feita junto com você",
  "Canal direto com o fundador",
];

export function Fundador() {
  return (
    <SecaoLanding id="fundador" fundo="escuro">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-semibold text-destaque md:text-4xl">
            Seja um dos 6 primeiros.
          </h2>
          <p className="text-lg">
            Estamos abrindo a Tesia para um grupo pequeno de advogados do DF, onde os calendários
            locais de prazo já estão prontos. Quem entrar agora tem 15 dias grátis para testar a Lia
            no dia a dia, paga R$ 79 por mês enquanto a assinatura estiver ativa e ajuda a decidir o
            que a Tesia vai fazer a seguir.
          </p>
          <ul className="flex flex-col gap-2">
            {incluido.map((item) => (
              <li key={item} className="flex gap-2 text-sm">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-destaque" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Card className="px-5 text-texto">
          <FormularioFundador />
        </Card>
      </div>
    </SecaoLanding>
  );
}
