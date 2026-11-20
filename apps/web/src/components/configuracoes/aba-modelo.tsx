import { PainelTimbrado, type DadosTimbrado } from "@/components/modelo/painel-timbrado";

export function AbaModelo({ modelo }: { modelo: DadosTimbrado }) {
  return <PainelTimbrado dados={modelo} />;
}
