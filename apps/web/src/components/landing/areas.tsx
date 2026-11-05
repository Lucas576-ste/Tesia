import { Badge } from "@/components/ui/badge";
import { SecaoLanding } from "./secao-landing";

const areas = ["Cível e consumidor", "Trabalhista", "Previdenciário", "Família"];

export function Areas() {
  return (
    <SecaoLanding titulo="Para quem atua em:">
      <div className="flex flex-wrap gap-2">
        {areas.map((area) => (
          <Badge key={area} variant="secondary" className="px-3 py-1 text-sm">
            {area}
          </Badge>
        ))}
        <Badge variant="outline" className="px-3 py-1 text-sm text-texto-secundario italic">
          Criminal e tributário (em breve)
        </Badge>
      </div>
      <p className="text-texto-secundario">
        Atua em outra área?{" "}
        <a href="#fundador" className="text-primaria underline">
          Entre na lista
        </a>{" "}
        e avisamos quando chegar.
      </p>
    </SecaoLanding>
  );
}
