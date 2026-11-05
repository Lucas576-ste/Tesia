import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

type EstadoVazioProps = {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
};

export function EstadoVazio({ titulo, descricao, acao }: EstadoVazioProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-5 text-center">
      <Inbox aria-hidden className="size-8 text-texto-secundario" />
      <div>
        <p className="font-medium">{titulo}</p>
        <p className="text-sm text-texto-secundario">{descricao}</p>
      </div>
      {acao}
    </div>
  );
}
