import { Badge } from "@/components/ui/badge";
import type { StatusPrazo } from "@/lib/prazo";
import { cn } from "@/lib/utils";

const selos: Record<StatusPrazo, { rotulo: string; cor: string }> = {
  nao_iniciado: { rotulo: "Não iniciado", cor: "bg-erro-fundo text-erro" },
  rascunho_pronto: { rotulo: "Rascunho pronto", cor: "bg-atencao-fundo text-atencao" },
  protocolado: { rotulo: "Protocolado", cor: "bg-sucesso-fundo text-sucesso" },
};

const rotulosManuais: Record<StatusPrazo, string> = {
  nao_iniciado: "Confirmado",
  rascunho_pronto: "Rascunho pronto",
  protocolado: "Cumprido",
};

type SeloStatusProps = {
  status: StatusPrazo;
  manual?: boolean;
};

export function SeloStatus({ status, manual = false }: SeloStatusProps) {
  const { rotulo, cor } = selos[status];
  return (
    <Badge className={cn("border-transparent", cor)}>
      {manual ? rotulosManuais[status] : rotulo}
    </Badge>
  );
}
