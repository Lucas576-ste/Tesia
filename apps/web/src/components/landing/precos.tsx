import { AbasPrecos } from "./abas-precos";
import { FaixaPlus } from "./faixa-plus";
import { ReducaoRisco } from "./reducao-risco";
import { SecaoLanding } from "./secao-landing";

export function Precos() {
  return (
    <SecaoLanding id="precos" titulo={"Comece grátis. Depois, escolha o seu plano."}>
      <AbasPrecos />
      <ReducaoRisco />
      <FaixaPlus />
      <p className="text-base text-texto-secundario">
        Precisa de mais num dia corrido? 10 peças extras por R$ 19. Sem taxa de ativação. Cancele
        quando quiser e leve seus dados.
      </p>
    </SecaoLanding>
  );
}
