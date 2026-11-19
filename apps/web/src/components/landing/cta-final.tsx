import { Button } from "@/components/ui/button";
import { Confirmar } from "./confirmar";
import { CTA_TESTE } from "./cta";
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
        <Button asChild size="lg" className="reflexo-dourado">
          <a href={CTA_TESTE.href}>{CTA_TESTE.texto}</a>
        </Button>
        <p className="text-sm">{CTA_TESTE.apoio}</p>
      </div>
    </SecaoLanding>
  );
}
