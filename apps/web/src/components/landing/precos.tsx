import { AbasPrecos } from "./abas-precos";
import { Confirmar } from "./confirmar";
import { FaixaPlus } from "./faixa-plus";
import { SecaoLanding } from "./secao-landing";

export function Precos() {
  return (
    <SecaoLanding
      id="precos"
      titulo={
        <Confirmar motivo="valor da hora do advogado" alternativa="Preços">
          Menos do que uma hora do seu trabalho por mês.
        </Confirmar>
      }
    >
      <AbasPrecos />
      <FaixaPlus />
      <p className="text-sm text-texto-secundario">
        Precisa de mais? 10 peças extras a partir de R$ 19. Sem taxa de ativação. Cancele quando
        quiser. Exporte seus dados a qualquer momento.
      </p>
    </SecaoLanding>
  );
}
