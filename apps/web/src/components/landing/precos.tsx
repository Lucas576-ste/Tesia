import { AbasPrecos } from "./abas-precos";
import { Confirmar } from "./confirmar";
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
      <p className="text-sm text-texto-secundario">
        Precisa de mais? 10 peças extras por R$ 19. Cancele quando quiser. Exporte seus dados a
        qualquer momento.
      </p>
    </SecaoLanding>
  );
}
