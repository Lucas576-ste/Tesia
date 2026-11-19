import { Badge } from "@/components/ui/badge";
import { AREAS_ATUACAO } from "@/lib/onboarding";
import { SecaoLanding } from "./secao-landing";

export function Areas() {
  return (
    <SecaoLanding titulo="Para quem atua em:">
      <div className="flex flex-wrap gap-2">
        {AREAS_ATUACAO.map((area) => (
          <Badge key={area} variant="secondary" className="px-3 py-1 text-sm">
            {area}
          </Badge>
        ))}
      </div>
      <p className="text-texto-secundario">
        Cada área com as suas peças e os seus prazos: dias úteis no cível, no trabalho e no
        tributário; dias corridos no criminal, como manda o CPP.
      </p>
    </SecaoLanding>
  );
}
