import { Quote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Analise } from "@/lib/analise";
import { chaveDoGrifo, type Grifo } from "@/lib/formatar-publicacao";
import { TopicoDaDecisao } from "./topico-da-decisao";

type PontosAtacaveisProps = {
  pontos: Analise["pontos"];
  destaque: Grifo[];
  aoVerTrecho: (grifos: Grifo[]) => void;
};

export function PontosAtacaveis({ pontos, destaque, aoVerTrecho }: PontosAtacaveisProps) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
      <h2 className="text-lg font-semibold">Pontos que podem ser atacados</h2>
      {pontos.length === 0 && (
        <p className="text-sm text-texto-secundario">
          Não encontrei um ponto claro para atacar nesta decisão.
        </p>
      )}
      {pontos.map(({ titulo, explicacao, grifos }) => (
        <TopicoDaDecisao key={titulo} tom="fato" icone={Sparkles} titulo={titulo}>
          {explicacao && <p>{explicacao}</p>}
          {grifos.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              aria-pressed={chaveDoGrifo(destaque) === chaveDoGrifo(grifos)}
              onClick={() => aoVerTrecho(grifos)}
            >
              <Quote aria-hidden />
              Ver trecho
            </Button>
          )}
        </TopicoDaDecisao>
      ))}
    </section>
  );
}
