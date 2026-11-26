import { CalendarClock, Gavel, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Analise } from "@/lib/analise";
import { textoDoPrazo } from "@/lib/resumo-decisao";
import { TopicoDaDecisao } from "./topico-da-decisao";

type ResumoDaDecisaoProps = {
  analise: Analise;
  confirmado: boolean;
  aoLerMais: () => void;
};

export function ResumoDaDecisao({ analise, confirmado, aoLerMais }: ResumoDaDecisaoProps) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
      <h2 className="text-lg font-semibold">Entenda a intimação</h2>
      <TopicoDaDecisao tom="fato" icone={Info} titulo="O que aconteceu">
        <p>{analise.resumo}</p>
      </TopicoDaDecisao>
      {analise.resultado && (
        <TopicoDaDecisao tom="decisao" icone={Gavel} titulo="O que foi decidido">
          <p>{analise.resultado}</p>
        </TopicoDaDecisao>
      )}
      <TopicoDaDecisao tom="prazo" icone={CalendarClock} titulo="Seu prazo">
        <p>{textoDoPrazo(analise, confirmado)}</p>
      </TopicoDaDecisao>
      <Button variant="outline" size="sm" className="w-fit" onClick={aoLerMais}>
        Ler mais
      </Button>
    </section>
  );
}
