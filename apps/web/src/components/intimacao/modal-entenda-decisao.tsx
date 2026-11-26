import { CalendarClock, Gavel, Info, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Analise } from "@/lib/analise";
import { dividirFrases } from "@/lib/formatar-publicacao";
import { rotuloDoAto, textoDoPrazo } from "@/lib/resumo-decisao";
import { AvisoDePrazo } from "./aviso-de-prazo";
import { TopicoDaDecisao } from "./topico-da-decisao";

const POLOS = { ativo: "polo ativo", passivo: "polo passivo" };

type ModalEntendaDecisaoProps = {
  analise: Analise;
  confirmado: boolean;
  aberto: boolean;
  aoFechar: () => void;
};

export function ModalEntendaDecisao({
  analise,
  confirmado,
  aberto,
  aoFechar,
}: ModalEntendaDecisaoProps) {
  return (
    <Dialog open={aberto} onOpenChange={(valor) => !valor && aoFechar()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Entenda a decisão</DialogTitle>
          <DialogDescription>
            {rotuloDoAto(analise.tipoAto)} · {analise.cnj}
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
          {analise.partesDetalhadas.length > 0 && (
            <TopicoDaDecisao tom="fato" icone={Users} titulo="Partes">
              <ul>
                {analise.partesDetalhadas.map(({ nome, polo, cliente }) => (
                  <li key={`${nome}-${polo}`}>
                    {nome}
                    {polo && ` (${POLOS[polo]})`}
                    {cliente && <strong> · seu cliente</strong>}
                  </li>
                ))}
              </ul>
            </TopicoDaDecisao>
          )}
          <TopicoDaDecisao tom="fato" icone={Info} titulo="O que aconteceu">
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {dividirFrases(analise.resumo).map((frase) => (
                <li key={frase}>{frase}</li>
              ))}
            </ul>
          </TopicoDaDecisao>
          {analise.resultado && (
            <TopicoDaDecisao tom="decisao" icone={Gavel} titulo="O que foi decidido">
              <p>{analise.resultado}</p>
            </TopicoDaDecisao>
          )}
          <TopicoDaDecisao tom="prazo" icone={CalendarClock} titulo="Seu prazo">
            <p>{textoDoPrazo(analise, confirmado)}</p>
            {analise.prazo?.fundamento && <p>Fundamento: {analise.prazo.fundamento}</p>}
            <AvisoDePrazo texto={analise.avisoPrazo} />
          </TopicoDaDecisao>
        </div>
        <p className="border-t pt-3 text-xs text-texto-secundario">
          Gerado pela IA a partir do documento. Confira antes de usar.
        </p>
      </DialogContent>
    </Dialog>
  );
}
