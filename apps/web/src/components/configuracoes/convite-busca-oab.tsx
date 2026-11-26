import { useState } from "react";
import { Button } from "@/components/ui/button";

type ConviteBuscaOabProps = {
  temOabValida: boolean;
  informouOab: boolean;
  ocupado: boolean;
  aoAceitar: () => void;
};

export function ConviteBuscaOab({
  temOabValida,
  informouOab,
  ocupado,
  aoAceitar,
}: ConviteBuscaOabProps) {
  const [recusou, setRecusou] = useState(false);

  if (!temOabValida) {
    return (
      <p className="text-sm text-texto-secundario">
        {informouOab
          ? "Confira o número da sua OAB em Seu perfil."
          : "Informe a OAB e a UF no perfil para ativar a busca."}
      </p>
    );
  }

  if (recusou) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-texto-secundario">
        <p>Tudo bem, nada será buscado.</p>
        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setRecusou(false)}>
          Ativar a busca
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-texto-secundario">
        Posso buscar nos diários as publicações em nome da sua OAB e trazer para a sua lista? Você
        pode parar quando quiser.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={ocupado} onClick={aoAceitar}>
          Sim, buscar
        </Button>
        <Button size="sm" variant="outline" disabled={ocupado} onClick={() => setRecusou(true)}>
          Agora não
        </Button>
      </div>
    </>
  );
}
