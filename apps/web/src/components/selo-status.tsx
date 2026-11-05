import { Badge } from "@/components/ui/badge";
import type { StatusPrazo } from "@/lib/prazo";
import { cn } from "@/lib/utils";

const selos: Record<StatusPrazo, { rotulo: string; cor: string }> = {
  nao_iniciado: { rotulo: "Não iniciado", cor: "bg-erro-fundo text-erro" },
  rascunho_pronto: { rotulo: "Rascunho pronto", cor: "bg-atencao-fundo text-atencao" },
  protocolado: { rotulo: "Protocolado", cor: "bg-sucesso-fundo text-sucesso" },
};

export function SeloStatus({ status }: { status: StatusPrazo }) {
  const { rotulo, cor } = selos[status];
  return <Badge className={cn("border-transparent", cor)}>{rotulo}</Badge>;
}
