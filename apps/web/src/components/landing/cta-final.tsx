import { Button } from "@/components/ui/button";
import { Confirmar } from "./confirmar";
import { SecaoLanding } from "./secao-landing";

export function CtaFinal() {
  return (
    <SecaoLanding
      fundo="escuro"
      titulo={
        <Confirmar
          motivo="tempo real da análise"
          alternativa="A próxima intimação não precisa tomar a sua noite."
        >
          A próxima intimação pode levar 30 minutos, não uma noite.
        </Confirmar>
      }
    >
      <div className="flex flex-col items-start gap-3">
        <Button
          asChild
          size="lg"
          className="bg-destaque text-menu not-disabled:hover:bg-destaque/90"
        >
          <a href="#fundador">Quero ser cliente fundador</a>
        </Button>
        <p className="text-sm">
          <Confirmar motivo="só usar se for verdade">
            Restam poucas vagas do programa fundador.
          </Confirmar>
        </p>
      </div>
    </SecaoLanding>
  );
}
