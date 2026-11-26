import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isoParaData } from "@/lib/prazo-interno";

type DialogoConcluirProps = {
  aberto: boolean;
  prazo: string;
  ocupado: boolean;
  aoFechar: () => void;
  aoConcluir: (cumprirPrazo: boolean) => void;
};

export function DialogoConcluir({
  aberto,
  prazo,
  ocupado,
  aoFechar,
  aoConcluir,
}: DialogoConcluirProps) {
  return (
    <Dialog open={aberto} onOpenChange={(valor) => !valor && aoFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Você também cumpriu o prazo?</DialogTitle>
          <DialogDescription>
            Esta intimação tem um prazo confirmado para {isoParaData(prazo)}. Se marcar como
            cumprido, ele sai dos pendentes; dá para desfazer pelo painel.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button variant="outline" disabled={ocupado} onClick={() => aoConcluir(false)}>
            Concluir e manter no painel
          </Button>
          <Button disabled={ocupado} onClick={() => aoConcluir(true)}>
            Sim, cumpri o prazo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
