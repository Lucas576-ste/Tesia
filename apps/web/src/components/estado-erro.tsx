import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type EstadoErroProps = {
  descricao: string;
  aoTentarDeNovo: () => void;
};

export function EstadoErro({ descricao, aoTentarDeNovo }: EstadoErroProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-xl bg-erro-fundo p-5 text-center"
    >
      <CircleAlert aria-hidden className="size-8 text-erro" />
      <p className="text-sm text-erro">{descricao}</p>
      <Button variant="outline" onClick={aoTentarDeNovo}>
        Tentar de novo
      </Button>
    </div>
  );
}
