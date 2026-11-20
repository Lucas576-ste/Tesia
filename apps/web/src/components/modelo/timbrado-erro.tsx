import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type TimbradoErroProps = {
  mensagem: string;
  aoTentarOutro: () => void;
};

export function TimbradoErro({ mensagem, aoTentarOutro }: TimbradoErroProps) {
  return (
    <Card role="alert" className="flex flex-col gap-4 border-erro p-6">
      <div className="flex items-start gap-3">
        <AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-erro" />
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-titulo">Não conseguimos usar este arquivo</p>
          <p className="text-sm text-texto-secundario">{mensagem}</p>
        </div>
      </div>
      <Button onClick={aoTentarOutro} className="w-fit">
        Tentar outro arquivo
      </Button>
    </Card>
  );
}
