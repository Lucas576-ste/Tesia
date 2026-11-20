import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ModalRemoverTimbradoProps = {
  aberto: boolean;
  removendo: boolean;
  aoMudar: (aberto: boolean) => void;
  aoConfirmar: () => void;
};

export function ModalRemoverTimbrado({
  aberto,
  removendo,
  aoMudar,
  aoConfirmar,
}: ModalRemoverTimbradoProps) {
  return (
    <Dialog open={aberto} onOpenChange={aoMudar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover seu timbrado?</DialogTitle>
          <DialogDescription>As próximas peças sairão sem cabeçalho e rodapé.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={aoConfirmar} disabled={removendo}>
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
