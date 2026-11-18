import { EnvioModelo, type DadosModelo } from "@/components/modelo/envio-modelo";
import { PreviaPeca } from "@/components/onboarding/previa-peca";
import { Card } from "@/components/ui/card";

export function AbaModelo({ modelo }: { modelo: DadosModelo }) {
  return (
    <Card className="grid gap-5 p-4 md:grid-cols-2">
      <EnvioModelo {...modelo} />
      <PreviaPeca timbrado={modelo.temModelo} />
    </Card>
  );
}
