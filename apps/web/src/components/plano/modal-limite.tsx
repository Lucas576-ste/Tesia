import { UsoMes } from "@/components/layout/uso-mes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ModalLimiteProps = {
  aberto: boolean;
  bloqueio: boolean;
  limite: number;
  pacote: string;
  aoMudar: (aberto: boolean) => void;
  aoComprar: () => void;
  aoMudarPlano: () => void;
};

export function ModalLimite({
  aberto,
  bloqueio,
  limite,
  pacote,
  aoMudar,
  aoComprar,
  aoMudarPlano,
}: ModalLimiteProps) {
  const usadas = bloqueio ? limite : Math.round(limite * 0.8);

  return (
    <Dialog open={aberto} onOpenChange={aoMudar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {bloqueio ? "Você chegou ao limite de hoje" : "Faltam poucas peças hoje"}
          </DialogTitle>
          <DialogDescription>
            {bloqueio
              ? "O limite volta amanhã. Para gerar mais hoje, compre um pacote extra ou mude de plano. A análise de intimações e os prazos continuam funcionando."
              : `Você já usou ${usadas} das ${limite} peças de hoje.`}
          </DialogDescription>
        </DialogHeader>
        <UsoMes usadas={usadas} limite={limite} className="w-full" />
        <DialogFooter>
          <Button variant="outline" onClick={aoMudarPlano}>
            Mudar de plano
          </Button>
          <Button onClick={aoComprar}>Comprar 10 peças por {pacote}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
